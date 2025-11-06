import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { StayPlanStatus, StayPlanType } from '../../enums/stayplan.enum';

@InputType()
export class StayPlanUpdateInput {
	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	_id: string;

	@IsOptional()
	@IsEnum(StayPlanType)
	@Field(() => StayPlanType, { nullable: true })
	stayPlanType?: StayPlanType;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	stayPlanName?: string;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	stayPlanBasePrice?: number;

	@IsOptional()
	@Field(() => GraphQLJSONObject, { nullable: true })
	stayPlanRules?: Record<string, unknown>;

	@IsOptional()
	@IsEnum(StayPlanStatus)
	@Field(() => StayPlanStatus, { nullable: true })
	stayPlanstatus?: StayPlanStatus;
}
