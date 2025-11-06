import { Field, InputType, Int } from '@nestjs/graphql';
import {
	IsEnum,
	IsInt,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	Matches,
	Min,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus } from '../../enums/reservation';
import { DATE_REGEX, TIME_REGEX } from '../../utils/datetime.util';

@InputType()
export class ReservationPriceBreakdownInput {
	@Matches(DATE_REGEX, { message: 'date must be in YYYY-MM-DD format' })
	@IsNotEmpty()
	@Field(() => String)
	date: string;

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
	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	memberId: string;

	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	propertyId: string;

	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	roomTypeId: string;

	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	stayPlanId: string;

	@IsOptional()
	@IsEnum(ReservationStatus)
	@Field(() => ReservationStatus, { nullable: true })
	reservationStatus?: ReservationStatus;

	@IsInt()
	@Min(1)
	@Field(() => Int)
	reservationQty: number;

	@ValidateNested({ each: true })
	@Type(() => ReservationPriceBreakdownInput)
	@Field(() => [ReservationPriceBreakdownInput])
	priceBreakdown: ReservationPriceBreakdownInput[];

	@IsInt()
	@Min(0)
	@Field(() => Int)
	reservationTotalPrice: number;

	@IsOptional()
	@Matches(DATE_REGEX, { message: 'reservationCheckIn must be in YYYY-MM-DD format' })
	@Field(() => String, { nullable: true })
	reservationCheckIn?: string;

	@IsOptional()
	@Matches(DATE_REGEX, { message: 'reservationCheckOut must be in YYYY-MM-DD format' })
	@Field(() => String, { nullable: true })
	reservationCheckOut?: string;

	@IsOptional()
	@Matches(DATE_REGEX, { message: 'reservationDate must be in YYYY-MM-DD format' })
	@Field(() => String, { nullable: true })
	reservationDate?: string;

	@IsOptional()
	@Matches(TIME_REGEX, { message: 'reservationCheckInAt must be in HH:mm format' })
	@Field(() => String, { nullable: true })
	reservationCheckInAt?: string;

	@IsOptional()
	@Matches(TIME_REGEX, { message: 'reservationCheckOutAt must be in HH:mm format' })
	@Field(() => String, { nullable: true })
	reservationCheckOutAt?: string;
}
