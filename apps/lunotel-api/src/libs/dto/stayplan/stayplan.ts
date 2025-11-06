import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { GraphQLJSONObject } from 'graphql-type-json';
import { StayPlanStatus, StayPlanType } from '../../enums/stayplan.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class StayPlan {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	roomTypeId: ObjectId;

	@Field(() => StayPlanType)
	stayPlanType: StayPlanType;

	@Field(() => String)
	stayPlanName: string;

	@Field(() => Int, { nullable: true })
	stayPlanBasePrice?: number;

	@Field(() => GraphQLJSONObject)
	stayPlanRules: Record<string, unknown>;

	@Field(() => StayPlanStatus)
	stayPlanstatus: StayPlanStatus;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class StayPlans {
	@Field(() => [StayPlan])
	list: StayPlan[];

	@Field(() => [TotalCounter])
	metaCounter: TotalCounter[];
}
