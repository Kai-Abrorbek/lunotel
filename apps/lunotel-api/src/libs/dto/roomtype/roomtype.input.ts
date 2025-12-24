import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { availablePropertySorts } from '../../config';
import { Direction } from '../../enums/common.enum';
import { RoomAmenity, RoomStatus } from '../../enums/propertyRoomtype.enum';

@InputType()
export class STPRules {
	@IsOptional()
	@Field(() => String, { nullable: true })
	durationHours: string;

	@IsNotEmpty()
	@Field(() => String)
	windowStart: string;

	@IsNotEmpty()
	@Field(() => String)
	windowEnd: string;

	@IsNotEmpty()
	@Field(() => String)
	lastCheckInBy: string;
}

@InputType()
export class RoomTypeInput {
	@IsNotEmpty()
	@Field(() => String)
	propertyId: ObjectId;

	@IsNotEmpty()
	@Length(5, 100)
	@Field(() => String)
	roomName: String;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	roomMaxPersonal: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	roomStandPersonal: number;

	@IsNotEmpty()
	@IsInt()
	@Field(() => Int)
	basePriceOvernight: number;

	@IsNotEmpty()
	@IsInt()
	@Field(() => Int)
	basePriceDayUse: number;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	roomDiscountPrice?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	roombedInfo?: String;

	@IsOptional()
	@Field(() => RoomStatus, { nullable: true })
	roomStatus?: RoomStatus;

	@IsNotEmpty()
	@Field(() => [String])
	roomImages: string[];

	@IsNotEmpty()
	@Field(() => [RoomAmenity])
	roomAmenities: RoomAmenity[];

	@IsNotEmpty()
	@Field(() => STPRules)
	stayPlanRules: STPRules;
}

@InputType()
export class RIsearch {
	@IsNotEmpty()
	@Field(() => String)
	propertyId?: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	roomName?: string;

	@IsOptional()
	@Field(() => RoomStatus, { nullable: true })
	roomStatus?: RoomStatus;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	roomMaxPersonal?: number;
}

@InputType()
export class RoomsIquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availablePropertySorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => RIsearch, { nullable: true })
	search?: RIsearch;
}
