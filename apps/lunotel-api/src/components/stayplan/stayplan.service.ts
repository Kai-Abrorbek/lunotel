import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StayPlan } from '../../libs/dto/stayplan/stayplan';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StayPlanInput } from '../../libs/dto/stayplan/stayplan.input';
import { StayPlanType } from '../../libs/enums/stayplan.enum';
import { RoomType } from '../../libs/dto/roomtype/roomtype';
import { STPRules } from '../../libs/dto/roomtype/roomtype.input';

@Injectable()
export class StayplanService {
	constructor(@InjectModel('StayPlan') private readonly stayPlanModel: Model<StayPlan>) {}

	public async createStayPlan(
		roomType: RoomType,
		basePriceDayUse: number,
		basePriceOvernight: number,
		stayPlanRules: STPRules,
	): Promise<StayPlan[]> {
		try {
			const stayPlanInput: StayPlanInput[] = [
				{
					roomTypeId: roomType._id,
					stayPlanType: StayPlanType.DAY_USE,
					stayPlanName: '대실 기본',
					stayPlanBasePrice: basePriceDayUse,
					stayPlanRules: {
						durationHours: stayPlanRules.durationHours,
						windowStart: stayPlanRules.windowStart,
						windowEnd: stayPlanRules.windowEnd,
						lastCheckInBy: stayPlanRules.lastCheckInBy,
					},
				},
				{
					roomTypeId: roomType._id,
					stayPlanType: StayPlanType.OVERNIGHT,
					stayPlanName: '숙박 기본',
					stayPlanBasePrice: basePriceOvernight,
					stayPlanRules: {
						checkInFrom: stayPlanRules.windowStart,
						checkInUntil: stayPlanRules.lastCheckInBy,
						checkOutBy: stayPlanRules.windowStart,
					},
				},
			];

			const result = await this.stayPlanModel.create(stayPlanInput);
			return result;
		} catch (err) {
			throw new InternalServerErrorException(err);
		}
	}
}
