import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

@Injectable()
export class RoomtypeService {
	constructor(
		@InjectModel('RoomType') private readonly roomTypeModel: Model<RoomType>,
		private readonly propertyService: PropertyService,
		private readonly stayPlanService: StayplanService,
		private readonly inventoryService: InventoryService,
	) {}

	public async createRoomType(input: RoomTypeInput, memberId: ObjectId): Promise<RoomType> {
		try {
			const roomType = await this.roomTypeModel.create(input);
			if (roomType) {
				// STAP 1 CREATE STAYPLAN
				const stayPlans = await this.stayPlanService.createStayPlan(
					roomType,
					input.basePriceDayUse,
					input.basePriceOvernight,
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
			roomStatus: { $in: [RoomStatus.DRAFT, RoomStatus.ACTIVE] },
		};

		const result = await this.roomTypeModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async getMyRooms(input: RoomsIquiry, memberId: ObjectId): Promise<RoomTypes> {
		const match: T = {
			propertyId: shapeIntoMongoObjectId(input.search.propertyId),
		};

		if (input.search.roomName) match.roomName = { $regex: new RegExp(input.search.roomName, 'i') };
		if (input.search.roomStatus) match.roomStatus = input.search.roomStatus;
		if (input.search.roomMaxPersonal) match.roomMaxPersonal = { $lte: input.search.roomMaxPersonal };

		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const data = await this.roomTypeModel.aggregate([
			{ $match: match },
			{ $sort: sort },
			{
				$facet: {
					list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);

		if (!data.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return data[0];
	}
}
