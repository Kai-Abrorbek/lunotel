import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { MemberStatus, MemberType } from '../../enums/member.enum';
import { availableAgentSorts, availableMembersSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class SignupInput {
	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Field(() => String)
	memberPhone: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string;

	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	memberEmail: string;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType: MemberType;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberImage?: String;

	@IsOptional()
	@Field(() => MemberStatus, { nullable: true })
	memberStatus: MemberStatus;
}

@InputType()
export class LoginInput {
	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string;
}

@InputType()
class AIsearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class AgentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableAgentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => AIsearch, { nullable: true })
	search?: AIsearch;
}

/** ADMIN **/

@InputType()
class MIsearch {
	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => MemberStatus, { nullable: true })
	memberStatus?: MemberStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class MembersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableMembersSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => MIsearch, { nullable: true })
	search?: MIsearch;
}
