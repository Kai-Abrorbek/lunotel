import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation } from '../../libs/dto/reservation/reservation';
import { Model, ObjectId } from 'mongoose';
import { ReservationInput, ReservationPriceBreakdownInput } from '../../libs/dto/reservation/reservation.input';
import { Message } from '../../libs/enums/common.enum';
import { RoomType } from '../../libs/dto/roomtype/roomtype';
import { Inventory } from '../../libs/dto/inventory/inventory';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { StayPlan } from '../../libs/dto/stayplan/stayplan';

@Injectable()
export class ReservationService {
	constructor(
		@InjectModel('Reservation') private readonly reservationModel: Model<Reservation>,
		@InjectModel('RoomType') private readonly roomTypeModel: Model<RoomType>,
		@InjectModel('StayPlan') private readonly stayPlanModel: Model<StayPlan>,
		@InjectModel('Inventory') private readonly inventoryModel: Model<Inventory>,
	) {}

	public async createReservation(input: ReservationInput, memberId: ObjectId): Promise<Reservation> {
		try {
			const member = memberId ?? null;
			const propertyId = shapeIntoMongoObjectId(input.propertyId);
			const roomTypeId = shapeIntoMongoObjectId(input.roomTypeId);
			const stayPlanId = shapeIntoMongoObjectId(input.stayPlanId);

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
					date: input.reservationCheckIn,
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

			const result: Reservation = await this.reservationModel.create(reservationInput);

			if (result) {
				await Promise.all(
					inventorys.map(async (inv) => {
						await this.inventoryModel.findOneAndUpdate(
							{ _id: inv._id, inventoryAllotment: { $gte: 1 } }, // 재고≥1 조건
							{ $inc: { inventoryAllotment: -1 } },
						);
					}),
				);
			}

			return result;
		} catch (err) {
			throw new BadRequestException(err);
		}
	}
}
