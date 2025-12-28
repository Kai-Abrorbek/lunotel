import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { RoomAmenity, RoomStatus } from '../../enums/propertyRoomtype.enum';
import { StayPlan } from '../stayplan/stayplan';
import { TotalCounter } from '../member/member';
import { Reservation } from '../reservation/reservation';

@ObjectType()
export class SRules {
	@Field(() => String, { nullable: true })
	durationHours: string;

	@Field(() => String)
	windowStart: string;

	@Field(() => String)
	windowEnd: string;

	@Field(() => String)
	lastCheckInBy: string;
}

@ObjectType()
export class RoomType {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	propertyId: ObjectId;

	@Field(() => String)
	roomName: string;

	@Field(() => Number)
	roomMaxPersonal: number;

	@Field(() => Number)
	roomStandPersonal: number;

	@Field(() => Number)
	basePriceDayUse: number;

	@Field(() => Number)
	basePriceOvernight: number;

	@Field(() => Number, { nullable: true })
	roomDiscountPrice: number;

	@Field(() => [String])
	roomImages: string[];

	@Field(() => [RoomAmenity], { nullable: true })
	roomAmenities?: RoomAmenity[];

	@Field(() => RoomStatus)
	roomStatus: RoomStatus;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/* from aggregatio */
	@Field(() => [StayPlan], { nullable: true })
	stayPlans?: StayPlan[];

	@Field(() => [Reservation], { nullable: true })
	reservationData?: Reservation[];
}

@ObjectType()
export class RoomTypes {
	@Field(() => [RoomType])
	list: RoomType[];

	@Field(() => [TotalCounter])
	metaCounter: TotalCounter[];
}
