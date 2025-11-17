import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { Reservation } from '../reservation/reservation';
import { notEqual } from 'assert';

@ObjectType()
export class Member {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => MemberType)
	memberType: MemberType;

	@Field(() => MemberStatus)
	memberStatus: MemberStatus;

	@Field(() => MemberAuthType)
	memberAuthType: MemberAuthType;

	@Field(() => String)
	memberPhone: string;

	@Field(() => String)
	memberNick: string;

	@Field(() => String)
	memberEmail: string;

	memberPassword?: string;

	@Field(() => String, { nullable: true })
	memberFullName?: string;

	@Field(() => String)
	memberImage: string;

	@Field(() => String, { nullable: true })
	memberAddress?: string;

	@Field(() => String, { nullable: true })
	memberDesc?: string;

	@Field(() => Int)
	memberProperties: number;

	@Field(() => Int)
	memberReservations: number;

	@Field(() => Int)
	memberComments: number;

	@Field(() => Int)
	memberPoints: number;

	@Field(() => Int)
	memberWarnings: number;

	@Field(() => Int)
	memberBlocks: number;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => String, { nullable: true })
	accessToken?: string;

	/** from aggregate **/
	@Field(() => [Reservation], { nullable: true })
	reservationList?: Reservation[];
}

@ObjectType()
export class TotalCounter {
	@Field(() => Int)
	total?: number;
}

@ObjectType()
export class Members {
	@Field(() => [Member])
	list?: Member[];

	@Field(() => [TotalCounter])
	metaCounter?: TotalCounter[];
}
