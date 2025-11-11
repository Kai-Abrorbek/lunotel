import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StayPlan } from '../../libs/dto/stayplan/stayplan';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StayPlanInput } from '../../libs/dto/stayplan/stayplan.input';
import { StayPlanType } from '../../libs/enums/stayplan.enum';
import { RoomType } from '../../libs/dto/roomtype/roomtype';

@Injectable()
export class StayplanService {
	constructor(@InjectModel('StayPlan') private readonly stayPlanModel: Model<StayPlan>) {}

	public async createStayPlan(
		roomType: RoomType,
		basePriceDayUse: number,
		basePriceOvernight: number,
	): Promise<StayPlan[]> {
		try {
			const stayPlanInput: StayPlanInput[] = [
				{
					roomTypeId: roomType._id,
					stayPlanType: StayPlanType.DAY_USE,
					stayPlanName: '대실 기본',
					stayPlanBasePrice: basePriceDayUse,
					stayPlanRules: {
						durationHours: 5,
						windowStart: '10:00',
						windowEnd: '22:00',
						lastCheckInBy: '20:00',
					},
				},
				{
					roomTypeId: roomType._id,
					stayPlanType: StayPlanType.OVERNIGHT,
					stayPlanName: '숙박 기본',
					stayPlanBasePrice: basePriceOvernight,
					stayPlanRules: {
						checkInFrom: '15:00',
						checkInUntil: '23:00',
						checkOutBy: '11:00',
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
