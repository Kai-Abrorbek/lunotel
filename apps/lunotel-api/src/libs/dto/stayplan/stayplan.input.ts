import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { StayPlanStatus, StayPlanType } from '../../enums/stayplan.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class StayPlanInput {
	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	roomTypeId: ObjectId;

	@IsEnum(StayPlanType)
	@IsNotEmpty()
	@Field(() => StayPlanType)
	stayPlanType: StayPlanType;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	stayPlanName: string;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	stayPlanBasePrice?: number;

	@IsNotEmpty()
	@Field(() => GraphQLJSONObject)
	stayPlanRules: Record<string, unknown>;

	@IsOptional()
	@IsEnum(StayPlanStatus)
	@Field(() => StayPlanStatus, { nullable: true })
	stayPlanstatus?: StayPlanStatus;
}
