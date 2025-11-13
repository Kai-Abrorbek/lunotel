import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, Matches, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus } from '../../enums/reservation';
import { DATE_REGEX, TIME_REGEX } from '../../utils/datetime.util';
import { ReservationPriceBreakdownInput } from './reservation.input';
import { ObjectId } from 'mongoose';
import { StayPlanType } from '../../enums/stayplan.enum';

@InputType()
export class ReservationUpdateInput {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	roomTypeId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	stayPlanId: ObjectId;

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
