import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ObjectId } from 'mongoose';
import { RoomStatus } from '../../enums/propertyRoomtype.enum';

@InputType()
export class SPRules {
	@IsOptional()
	@Field(() => Int, { nullable: true })
	durationHours?: number;

	@IsNotEmpty()
	@Field(() => String, { nullable: true })
	windowStart?: string;

	@IsNotEmpty()
	@Field(() => String, { nullable: true })
	windowEnd?: string;

	@IsNotEmpty()
	@Field(() => String, { nullable: true })
	lastCheckInBy?: string;
}

@InputType()
export class RoomTypeUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	propertyId: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	roomName?: string;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	roomMaxPersonal?: number;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	roomStandPersonal?: number;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	basePriceDayUse?: number;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	basePriceOvernight?: number;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	roomDiscountPrice?: number;

	@IsOptional()
	@Length(5, 100)
	@Field(() => String, { nullable: true })
	roombedInfo?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	roomAmenities?: [string];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	roomImages?: [string];

	@IsOptional()
	@Field(() => RoomStatus, { nullable: true })
	roomStatus?: RoomStatus;

	@IsOptional()
	@Field(() => SPRules, { nullable: true })
	stayPlanRules?: SPRules;
}
