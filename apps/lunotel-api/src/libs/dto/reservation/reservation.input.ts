import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, Matches, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus } from '../../enums/reservation';
import { DATE_REGEX, TIME_REGEX } from '../../utils/datetime.util';
import { ObjectId } from 'mongoose';
import { StayPlanType } from '../../enums/stayplan.enum';
import { IsPhoneNumberKr } from '../validator/phone.validator';
import { Direction } from '../../enums/common.enum';

@InputType()
export class memberInfoInput {
	@IsNotEmpty()
	@Field(() => String)
	guestName;

	@IsPhoneNumberKr()
	@IsNotEmpty()
	@Field(() => String)
	guestPhone;

	// @IsOptional()
	// @Field(() => String, { nullable: true })
	// guestEmail;
}

@InputType()
export class NoAuthMemberInfoInput {
	@IsNotEmpty()
	@Field(() => String)
	reservationNumber;

	@IsPhoneNumberKr()
	@IsNotEmpty()
	@Field(() => String)
	guestPhone;

	// @IsNotEmpty()
	// @Field(() => String, { nullable: true })
	// guestEmail;
}

@InputType()
export class ReservationPriceBreakdownInput {
	@Matches(DATE_REGEX, { message: 'date must be in YYYY-MM-DD format' })
	@IsNotEmpty()
	@Field(() => String)
	date: string;

	@Matches(TIME_REGEX, { message: 'time must be in HH:mm format' })
	@IsNotEmpty()
	@Field(() => String)
	time: string;

	@IsInt()
	@Min(0)
	@Field(() => Int)
	unitPrice: number;

	@IsInt()
	@Min(1)
	@Field(() => Int)
	qty: number;

	@IsInt()
	@Min(0)
	@Field(() => Int)
	subtotal: number;
}

@InputType()
export class ReservationInput {
	@IsNotEmpty()
	@Field(() => String)
	propertyId: string;

	@IsNotEmpty()
	@Field(() => String)
	roomTypeId: string;

	@IsNotEmpty()
	@Field(() => String)
	stayPlanId: string;

	@IsOptional()
	@Field(() => StayPlanType, { nullable: true })
	reservationPlanType?: StayPlanType;

	@IsNotEmpty()
	@Matches(DATE_REGEX, { message: 'reservationCheckIn must be in YYYY-MM-DD format' })
	@Field(() => String)
	reservationCheckIn: string;

	@IsNotEmpty()
	@Matches(DATE_REGEX, { message: 'reservationCheckOut must be in YYYY-MM-DD format' })
	@Field(() => String)
	reservationCheckOut: string;

	@IsNotEmpty()
	@Matches(TIME_REGEX, { message: 'reservationCheckInAt must be in HH:mm format' })
	@Field(() => String)
	reservationCheckInAt: string;

	@IsNotEmpty()
	@Matches(TIME_REGEX, { message: 'reservationCheckOutAt must be in HH:mm format' })
	@Field(() => String)
	reservationCheckOutAt: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

	@IsNotEmpty()
	@Field(() => memberInfoInput)
	memberInfo: memberInfoInput;

	@IsOptional()
	@IsEnum(ReservationStatus)
	@Field(() => ReservationStatus, { nullable: true })
	reservationStatus?: ReservationStatus;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Field(() => Int, { nullable: true })
	reservationQty?: number;

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => ReservationPriceBreakdownInput)
	@Field(() => [ReservationPriceBreakdownInput], { nullable: true })
	priceBreakdown?: ReservationPriceBreakdownInput[];

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	reservationTotalPrice?: number;

	@IsOptional()
	@Matches(DATE_REGEX, { message: 'reservationDate must be in YYYY-MM-DD format' })
	@Field(() => String, { nullable: true })
	reservationDate?: string;
}

@InputType()
class ResIsearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	propertyId?: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;

	@IsOptional()
	@Field(() => ReservationStatus, { nullable: true })
	reservationStatus?: ReservationStatus;
}

@InputType()
export class ReservationsInquiry {
	@IsNotEmpty()
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	sort?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ResIsearch)
	search: ResIsearch;
}

@InputType()
export class RoomReservationsInquiry {
	@IsNotEmpty()
	@Field(() => String)
	propertyId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	roomTypeId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	stayPlanId: ObjectId;
}
