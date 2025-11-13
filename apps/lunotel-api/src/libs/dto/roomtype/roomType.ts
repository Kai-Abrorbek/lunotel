import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { RoomStatus } from '../../enums/propertyRoomtype.enum';
import { StayPlan } from '../stayplan/stayplan';
import { IsNotEmpty } from 'class-validator';
import { TotalCounter } from '../member/member';

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

	@Field(() => String)
	roombedInfo: string;

	@Field(() => [String])
	roomImages: [string];

	@Field(() => RoomStatus)
	roomStatus: RoomStatus;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/* from aggregatio */
	@Field(() => [StayPlan], { nullable: true })
	stayPlans?: StayPlan[];
}

@ObjectType()
export class RoomTypes {
	@Field(() => [RoomType])
	list: RoomType[];

	@Field(() => [TotalCounter])
	metaCounter: TotalCounter[];
}
