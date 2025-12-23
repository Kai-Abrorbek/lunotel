import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/lunotel-api/src/libs/dto/member/member';
import { Property } from 'apps/lunotel-api/src/libs/dto/property/property';
import { MemberStatus, MemberType } from 'apps/lunotel-api/src/libs/enums/member.enum';
import { PropertyStatus } from 'apps/lunotel-api/src/libs/enums/property.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.propertyModel
			.updateMany(
				{
					propertyStatus: PropertyStatus.ACTIVE,
				},
				{ propertyRank: 0 },
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: { $ne: MemberType.ADMIN },
				},
				{ memberRank: 0 },
			)
			.exec();
	}

	public async batchTopProperties(): Promise<void> {
		const properties: Property[] = await this.propertyModel
			.find({
				propertyStatus: PropertyStatus.ACTIVE,
				propertyRank: 0,
			})
			.exec();

		const promisedList = properties.map(async (ele: Property) => {
			const { _id, propertyViews, propertyLikes, propertyReservations } = ele;
			const rank = propertyLikes * 2 + propertyViews * 1 + propertyReservations * 5;
			return await this.propertyModel.findByIdAndUpdate(_id, { propertyRank: rank });
		});

		await Promise.all(promisedList);
	}

	public async batchTopAgents(): Promise<void> {
		const members: Member[] = await this.memberModel
			.find({
				memberStatus: MemberStatus.ACTIVE,
				memberType: MemberType.AGENT,
				memberRank: 0,
			})
			.exec();

		const promisedList = members.map(async (ele) => {
			const { _id, memberProperties, memberComments, memberReservations } = ele;
			const rank = memberProperties * 5 + memberComments * 3 + memberReservations * 2;
			return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank }).exec();
		});

		await Promise.all(promisedList);
	}

	public getHello(): string {
		return 'Welcome to NESTAR BATCH server!';
	}
}
