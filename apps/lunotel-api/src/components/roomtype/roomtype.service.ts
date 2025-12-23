import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { RoomType, RoomTypes } from '../../libs/dto/roomtype/roomtype';
import { RoomsIquiry, RoomTypeInput } from '../../libs/dto/roomtype/roomtype.input';
import { PropertyService } from '../property/property.service';
import { RoomTypeUpdate } from '../../libs/dto/roomtype/roomtype.update';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { RoomStatus } from '../../libs/enums/propertyRoomtype.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { StayplanService } from '../stayplan/stayplan.service';
import { InventoryService } from '../inventory/inventory.service';
import { Property } from '../../libs/dto/property/property';

@Injectable()
export class RoomtypeService {
	constructor(
		@InjectModel('RoomType') private readonly roomTypeModel: Model<RoomType>,
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		private readonly propertyService: PropertyService,
		private readonly stayPlanService: StayplanService,
		private readonly inventoryService: InventoryService,
	) {}

	public async getRoom(roomId: ObjectId, memberId: ObjectId): Promise<RoomType> {
		const match: T = { _id: roomId };

		const result = await this.roomTypeModel
			.aggregate([
				{ $match: match },
				{
					$lookup: {
						from: 'stayPlan',
						let: { roomTypeId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: { $eq: ['$roomTypeId', '$$roomTypeId'] },
								},
							},
							{ $sort: { stayPlanType: 1 as const } }, // ✅ 여기서 고정
						],
						as: 'stayPlans',
					},
				},

				{
					$lookup: {
						from: 'reservation',
						localField: '_id',
						foreignField: 'roomTypeId',
						as: 'reservationData',
					},
				},
			])
			.exec();
		return result[0];
	}

	public async createRoomType(input: RoomTypeInput, memberId: ObjectId): Promise<RoomType> {
		try {
			const roomTypeInput = {
				propertyId: input.propertyId,
				roomName: input.roomName,
				roomStandPersonal: input.roomStandPersonal,
				roomMaxPersonal: input.roomMaxPersonal,
				basePriceDayUse: input.basePriceDayUse,
				basePriceOvernight: input.basePriceOvernight,
				roomImages: input.roomImages,
				roomDiscountPrice: input.roomDiscountPrice ?? 0,
			};

			const roomType = await this.roomTypeModel.create(roomTypeInput);
			if (roomType) {
				// STAP 1 CREATE STAYPLAN
				const stayPlans = await this.stayPlanService.createStayPlan(
					roomType,
					input.basePriceDayUse,
					input.basePriceOvernight,
					input.stayPlanRules,
				);
				// STAP 2 CREATE INVENTORIES
				this.inventoryService.createInventorys(roomType, stayPlans);
				// STAP 3 UPDATE ROOMTYPE AND PROPERTIY
				const roomList = await this.roomTypeModel.find(
					{ propertyId: roomType.propertyId },
					{ basePriceOvernight: 1, basePriceDayUse: 1 },
				);

				const roomMinPrice = Math.min(...roomList.map((room) => room.basePriceOvernight));

				const propertyUpdateinput: PropertyUpdate = {
					_id: roomType.propertyId,
					propertyPrice: roomMinPrice,
				};

				await this.propertyService.updateProperty(memberId, propertyUpdateinput);
				await this.propertyService.propertyStatsEditor({
					_id: roomType.propertyId,
					modifier: 1,
					targetKey: 'propertyRooms',
				});
			}
			return roomType;
		} catch (err) {
			throw new InternalServerErrorException(err);
		}
	}

	public async updateRoomType(input: RoomTypeUpdate, memberId: ObjectId): Promise<RoomType> {
		const search: T = {
			_id: shapeIntoMongoObjectId(input._id),
			propertyId: shapeIntoMongoObjectId(input.propertyId),
		};

		const result = await this.roomTypeModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async getMyRooms(input: RoomsIquiry, memberId: ObjectId): Promise<RoomTypes> {
		const { page, limit, search } = input;
		const propertyId = shapeIntoMongoObjectId(search.propertyId);
		const property: Property = await this.propertyModel.findOne({ _id: propertyId, memberId: memberId }).exec();

		if (!property) throw new BadRequestException(Message.NO_DATA_FOUND);

		const match: T = { propertyId: propertyId };

		if (input.search.roomName) match.roomName = { $regex: new RegExp(input.search.roomName, 'i') };
		if (input.search.roomStatus) match.roomStatus = input.search.roomStatus;
		if (input.search.roomMaxPersonal) match.roomMaxPersonal = { $lte: input.search.roomMaxPersonal };

		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const data = await this.roomTypeModel.aggregate([
			{ $match: match },
			{ $sort: sort },
			{
				$facet: {
					list: [
						{ $skip: (page - 1) * limit },
						{ $limit: limit },
						{
							$lookup: {
								from: 'stayPlan',
								localField: '_id',
								foreignField: 'roomTypeId',
								as: 'stayPlans',
							},
						},
					],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);

		if (!data.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return data[0];
	}
}
