import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberStatus, MemberType } from '../../enums/member.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class MemberUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Length(3, 12)
	@Field(() => String, { nullable: true })
	memberNick?;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberPhone?;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberEmail?;

	@IsOptional()
	@Length(5, 12)
	@Field(() => String, { nullable: true })
	memberPassword?;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?;

	@IsOptional()
	@Field(() => MemberStatus, { nullable: true })
	memberStatus?;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberFullName?;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberImage?;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberAddress?;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberDesc?;
}
