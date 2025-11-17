import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation, Reservations } from '../../libs/dto/reservation/reservation';
import { Model, ObjectId } from 'mongoose';
import {
	NoAuthMemberInfoInput,
	ReservationInput,
	ReservationPriceBreakdownInput,
	ReservationsInquiry,
} from '../../libs/dto/reservation/reservation.input';
import { Message } from '../../libs/enums/common.enum';
import { RoomType } from '../../libs/dto/roomtype/roomtype';
import { Inventory } from '../../libs/dto/inventory/inventory';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { StayPlan } from '../../libs/dto/stayplan/stayplan';
import { ReservationUpdateInput } from '../../libs/dto/reservation/reservation.update';
import { T } from '../../libs/types/common';
import { NotificationService } from '../notification/notification.service';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { Property } from '../../libs/dto/property/property';
import { NotificationType } from '../../libs/enums/notification.enum';
import { MemberService } from '../member/member.service';
import { ReservationStatus } from '../../libs/enums/reservation';

@Injectable()
export class ReservationService {
	constructor(
		@InjectModel('Reservation') private readonly reservationModel: Model<Reservation>,
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('RoomType') private readonly roomTypeModel: Model<RoomType>,
		@InjectModel('StayPlan') private readonly stayPlanModel: Model<StayPlan>,
		@InjectModel('Inventory') private readonly inventoryModel: Model<Inventory>,
		private readonly notificationService: NotificationService,
		private readonly memberService: MemberService,
	) {}

	public async createReservation(input: ReservationInput, memberId: ObjectId): Promise<Reservation> {
		try {
			const member = memberId ?? null;
			const propertyId = shapeIntoMongoObjectId(input.propertyId);
			const roomTypeId = shapeIntoMongoObjectId(input.roomTypeId);
			const stayPlanId = shapeIntoMongoObjectId(input.stayPlanId);

			const property: Property = await this.propertyModel.findOne({ _id: propertyId });
			const roomType: RoomType = await this.roomTypeModel.findOne({ _id: roomTypeId, propertyId: propertyId }).exec();

			if (!roomType) throw new BadRequestException(Message.NO_DATA_FOUND);

			const stayPlan: StayPlan = await this.stayPlanModel.findOne({ _id: stayPlanId, roomTypeId: roomTypeId }).exec();

			const inventorys: Inventory[] = await this.inventoryModel.find({
				roomTypeId: roomTypeId,
				stayPlanId: stayPlanId,
				inventoryDate: { $gte: input.reservationCheckIn, $lt: input.reservationCheckOut },
				inventoryAllotment: { $gt: 0 },
			});

			if (!inventorys.length) throw new BadRequestException('해당 날짜 재고가 없습니다!');

			let priceBreakdownList: ReservationPriceBreakdownInput[] = inventorys.map((inventory) => {
				return {
					date: inventory.inventoryDate,
					time: input.reservationCheckInAt,
					unitPrice: inventory.inventoryPrice,
					qty: input.reservationQty ?? 1,
					subtotal: inventory.inventoryPrice * (input.reservationQty ?? 1),
				};
			});

			const reservationTotalPrice = priceBreakdownList.reduce((sum, p) => sum + p.subtotal, 0);

			const reservationInput: ReservationInput = {
				memberId: member,
				propertyId: input.propertyId,
				roomTypeId: input.roomTypeId,
				stayPlanId: input.stayPlanId,
				memberInfo: input.memberInfo,
				reservationQty: 1,
				priceBreakdown: priceBreakdownList,
				reservationTotalPrice: reservationTotalPrice,
				reservationPlanType: stayPlan.stayPlanType,
				reservationCheckIn: input.reservationCheckIn,
				reservationCheckOut: input.reservationCheckOut,
				reservationCheckInAt: input.reservationCheckInAt,
				reservationCheckOutAt: input.reservationCheckOutAt,
				reservationDate: input.reservationCheckIn,
			};

			const reservation: Reservation = await this.reservationModel.create(reservationInput);

			if (reservation) {
				await Promise.all(
					inventorys.map(async (inv) => {
						await this.inventoryModel.findOneAndUpdate(
							{ _id: inv._id, inventoryAllotment: { $gte: 1 } }, // 재고≥1 조건
							{ $inc: { inventoryAllotment: -1 } },
						);
					}),
				);
			}

			if (memberId) {
				await this.memberService.memberStatsEditor({ _id: memberId, modifier: 1, targetKey: 'memberReservations' });
			}

			// SEND NOTIFICATION FOR => USER and OWNER
			if (memberId) {
				const period = `${reservation.reservationCheckIn} ~ ${reservation.reservationCheckOut}`;

				const notificationInputForMember: NotificationInput = {
					memberId: memberId,
					title: '예약이 완료되었습니다.',
					message: `${property.propertyName} (${roomType.roomName}) 예약이 완료되었습니다.\n이용 기간: ${period}`,
					type: NotificationType.RESERVATION_CREATED_USER,
					reservationId: reservation._id,
					propertyId: property._id,
				};

				await this.notificationService.createNotification(notificationInputForMember);
			}

			const period = `${reservation.reservationCheckIn} ~ ${reservation.reservationCheckOut}`;
			const notificationInputForOwner: NotificationInput = {
				memberId: property.memberId,
				title: '새 예약이 들어왔습니다.',
				message: `새 예약: ${roomType.roomName}\n고객: ${reservation.memberInfo.guestName}\n이용 기간: ${period}`,
				type: NotificationType.RESERVATION_CREATED_USER,
				reservationId: reservation._id,
				propertyId: property._id,
			};

			await this.notificationService.createNotification(notificationInputForOwner);

			return reservation;
		} catch (err) {
			throw new BadRequestException(err);
		}
	}

	public async updateReservation(input: ReservationUpdateInput, memberId: ObjectId): Promise<Reservation> {
		const reservation: Reservation = await this.reservationModel.findOne({ _id: input._id, memberId: memberId }).exec();

		if (!reservation) throw new BadRequestException(Message.NO_DATA_FOUND);

		const property: Property = await this.propertyModel.findOne({ _id: reservation.propertyId });

		const roomType: RoomType = await this.roomTypeModel
			.findOne({ _id: input.roomTypeId, propertyId: reservation.propertyId })
			.exec();
		const stayPlan: StayPlan = await this.stayPlanModel.findOne({ _id: input.stayPlanId }).exec();
		const inventorys: Inventory[] = await this.inventoryModel.find({
			roomTypeId: roomType._id,
			stayPlanId: stayPlan._id,
			inventoryDate: { $gte: input.reservationCheckIn, $lt: input.reservationCheckOut },
			inventoryAllotment: { $gt: 0 },
		});

		if (!inventorys.length) throw new BadRequestException('해당 날짜 재고가 없습니다!');

		let priceBreakdownList: ReservationPriceBreakdownInput[] = inventorys.map((inventory) => {
			return {
				date: inventory.inventoryDate,
				time: input.reservationCheckInAt ?? reservation.reservationCheckInAt,
				unitPrice: inventory.inventoryPrice === 0 ? stayPlan.stayPlanBasePrice : inventory.inventoryPrice,
				qty: input.reservationQty ?? 1,
				subtotal:
					inventory.inventoryPrice === 0
						? stayPlan.stayPlanBasePrice * (input.reservationQty ?? 1)
						: inventory.inventoryPrice,
			};
		});

		const reservationTotalPrice = priceBreakdownList.reduce((sum, p) => sum + p.subtotal, 0);

		const updateInput: ReservationUpdateInput = {
			_id: input._id,
			roomTypeId: roomType._id,
			stayPlanId: stayPlan._id,
			reservationQty: 1,
			priceBreakdown: priceBreakdownList,
			reservationTotalPrice: reservationTotalPrice,
			reservationPlanType: stayPlan.stayPlanType,
			reservationCheckIn: input.reservationCheckIn,
			reservationCheckOut: input.reservationCheckOut,
			reservationDate: input.reservationCheckIn,
		};

		const result: Reservation = await this.reservationModel
			.findOneAndUpdate({ _id: reservation._id }, updateInput, { new: true })
			.exec();

		if (result) {
			await Promise.all(
				inventorys.map(async (inv) => {
					await this.inventoryModel.findOneAndUpdate(
						{ _id: inv._id, inventoryAllotment: { $gte: 1 } }, // 재고≥1 조건
						{ $inc: { inventoryAllotment: -1 } },
					);
				}),
			);

			await Promise.all(
				reservation.priceBreakdown.map(async (breakdown) => {
					await this.inventoryModel.findOneAndUpdate(
						{
							roomTypeId: reservation.roomTypeId,
							stayPlanId: reservation.stayPlanId,
							inventoryDate: breakdown.date,
						},
						{ $inc: { inventoryAllotment: 1 } },
					);
				}),
			);
		}

		if (input.reservationStatus === ReservationStatus.CANCELLED) {
			if (memberId) {
				await this.memberService.memberStatsEditor({ _id: memberId, modifier: -1, targetKey: 'memberReservations' });
			}
		}

		// SEND NOTIFICATION FOR => USER and OWNER
		if (memberId) {
			const period = `${reservation.reservationCheckIn} ~ ${reservation.reservationCheckOut}`;

			const notificationInputForMember: NotificationInput = {
				memberId: memberId,
				title: '예약 정보가 변경되었습니다.',
				message: `${property.propertyName} (${roomType.roomName}) 예약 정보가 변경되었습니다.\n변경 후 기간: ${period}`,
				type: NotificationType.RESERVATION_UPDATED_USER,
				reservationId: reservation._id,
				propertyId: property._id,
			};

			await this.notificationService.createNotification(notificationInputForMember);
		}

		const period = `${reservation.reservationCheckIn} ~ ${reservation.reservationCheckOut}`;
		const notificationInputForOwner: NotificationInput = {
			memberId: property.memberId,
			title: '예약 정보가 변경되었습니다.',
			message: `예약 변경: ${roomType.roomName}\n변경 후 기간: ${period}`,
			type: NotificationType.RESERVATION_UPDATED_HOST,
			reservationId: reservation._id,
			propertyId: property._id,
		};

		await this.notificationService.createNotification(notificationInputForOwner);

		return result;
	}

	public async getMyReservation(input: NoAuthMemberInfoInput, memberId: ObjectId): Promise<Reservation> {
		const result = await this.reservationModel.findOne({
			_id: input.reservationNumber,
			memberId: memberId,
			'memberInfo.guestPhone': input.guestPhone,
		});

		if (!result) throw new BadRequestException(Message.NO_DATA_FOUND);

		return result;
	}

	public async getMyReservations(input: ReservationsInquiry, memberId: ObjectId): Promise<Reservations> {
		const { page, limit } = input;
		const match: T = { memberId: memberId };
		const data = await this.reservationModel.aggregate([
			{ $match: match },
			{ $sort: { createdAt: 1 } },
			{
				$facet: {
					list: [
						{ $skip: (page - 1) * limit },
						{ $limit: limit },
						{
							$lookup: {
								from: 'properties',
								localField: 'propertyId',
								foreignField: '_id',
								as: 'propertyData',
							},
						},
					],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);

		if (!data.length) throw new BadGatewayException(Message.NO_DATA_FOUND);

		return data[0];
	}
}
