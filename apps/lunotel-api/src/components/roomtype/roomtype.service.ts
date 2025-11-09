import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { RoomType } from '../../libs/dto/roomtype/roomtype';
import { RoomTypeInput } from '../../libs/dto/roomtype/roomtype.input';
import { PropertyService } from '../property/property.service';
import { RoomTypeUpdate } from '../../libs/dto/roomtype/roomtype.update';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { RoomStatus } from '../../libs/enums/propertyRoomtype.enum';
import { Message } from '../../libs/enums/common.enum';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { StayPlan } from '../../libs/dto/stayplan/stayplan';
import { StayPlanType } from '../../libs/enums/stayplan.enum';

@Injectable()
export class RoomtypeService {
	constructor(
		@InjectModel('RoomType') private readonly roomTypeModel: Model<RoomType>,
		@InjectModel('StayPlan') private readonly stayPlanModel: Model<StayPlan>,
		private readonly propertyservice: PropertyService,
	) {}

	public async createRoomType(input: RoomTypeInput, memberId: ObjectId): Promise<RoomType> {
		try {
			const result = await this.roomTypeModel.create(input);
			if (result) {
				await this.stayPlanModel.create([
					{
						roomTypeId: result._id,
						stayPlanType: StayPlanType.DAY_USE,
						stayPlanName: '대실 기본',
						stayPlanBasePrice: input.basePriceDayUse,
						stayPlanRules: {
							durationHours: 5,
							windowStart: '10:00',
							windowEnd: '22:00',
							lastCheckInBy: '20:00',
						},
					},
					{
						roomTypeId: result._id,
						stayPlanType: StayPlanType.OVERNIGHT,
						stayPlanName: '숙박 기본',
						stayPlanBasePrice: input.basePriceOvernight,
						stayPlanRules: {
							checkInFrom: '15:00',
							checkInUntil: '23:00',
							checkOutBy: '11:00',
						},
					},
				]);

				const roomList = await this.roomTypeModel.find(
					{ propertyId: result.propertyId },
					{ basePriceOvernight: 1, basePriceDayUse: 1 },
				);

				const roomMinPrice = Math.min(...roomList.map((room) => room.basePriceOvernight));

				const propertyUpdateinput: PropertyUpdate = {
					_id: result.propertyId,
					propertyPrice: roomMinPrice,
				};
				await this.propertyservice.updateProperty(memberId, propertyUpdateinput);
				await this.propertyservice.propertyStatsEditor({
					_id: result.propertyId,
					modifier: 1,
					targetKey: 'propertyRooms',
				});
			}
			return result;
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
}
