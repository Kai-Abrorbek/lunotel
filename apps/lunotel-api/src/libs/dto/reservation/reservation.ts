import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ReservationStatus } from '../../enums/reservation';
import { TotalCounter } from '../member/member';
import { Property } from '../property/property';

@ObjectType()
export class ReservationPriceBreakdownItem {
	@Field(() => String)
	date: string;

	@Field(() => Int)
	unitPrice: number;

	@Field(() => Int)
	qty: number;

	@Field(() => Int)
	subtotal: number;
}

@ObjectType()
export class type {
	@Field(() => String)
	guestName;

	@Field(() => String)
	guestPhone;

	// @IsOptional()
	// @Field(() => String, { nullable: true })
	// guestEmail;
}

@ObjectType()
export class Reservation {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

	@Field(() => String)
	propertyId: ObjectId;

	@Field(() => String)
	roomTypeId: ObjectId;

	@Field(() => String)
	stayPlanId: ObjectId;

	@Field(() => ReservationStatus)
	reservationStatus: ReservationStatus;

	@Field(() => Int)
	reservationQty: number;

	@Field(() => [ReservationPriceBreakdownItem])
	priceBreakdown: ReservationPriceBreakdownItem[];

	@Field(() => Int)
	reservationTotalPrice: number;

	@Field(() => String, { nullable: true })
	reservationCheckIn?: string;

	@Field(() => String, { nullable: true })
	reservationCheckOut?: string;

	@Field(() => type)
	memberInfo: type;

	@Field(() => String, { nullable: true })
	reservationDate?: string;

	@Field(() => String, { nullable: true })
	reservationCheckInAt?: string;

	@Field(() => String, { nullable: true })
	reservationCheckOutAt?: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** FROM AGGREGATE **/
	@Field(() => [Property], { nullable: true })
	propertyData?: Property[];
}

@ObjectType()
export class Reservations {
	@Field(() => [Reservation])
	list: Reservation[];

	@Field(() => [TotalCounter])
	metaCounter: TotalCounter[];
}
