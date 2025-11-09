import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
	PropertyAmenity,
	PropertyLocation,
	PropertyOtherAmenity,
	PropertyStatus,
	PropertyType,
} from '../../enums/property.enum';
import { Member, TotalCounter } from '../member/member';
import { RoomType } from '../roomtype/roomtype';
import { StayPlan } from '../stayplan/stayplan';
// import { MeLiked } from '../like/like';

@ObjectType()
export class Property {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => PropertyType)
	propertyType: PropertyType;

	@Field(() => PropertyStatus)
	propertyStatus: PropertyStatus;

	@Field(() => PropertyLocation)
	propertyLocation: PropertyLocation;

	@Field(() => String)
	propertyAddress: string;

	@Field(() => String)
	propertyName: string;

	@Field(() => Int)
	propertyPrice: number;

	@Field(() => Int)
	propertyRooms: number;

	@Field(() => Int)
	propertyViews: number;

	@Field(() => Int)
	propertyLikes: number;

	@Field(() => Int)
	propertyComments: number;

	@Field(() => Int)
	propertyRank: number;

	@Field(() => Int)
	propertyStars: number;

	@Field(() => [String])
	propertyImages: string[];

	@Field(() => [PropertyAmenity])
	propertyAmenities: PropertyAmenity[];

	@Field(() => [PropertyOtherAmenity])
	propertyOtherAmenities: PropertyOtherAmenity[];

	@Field(() => String, { nullable: true })
	propertyDesc?: string;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Boolean)
	soldAt: boolean;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/* from aggregatio */
	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => [RoomType], { nullable: true })
	rooms?: RoomType[];

	@Field(() => Int, { nullable: true })
	roomCount?: number;
	// @Field(() => [MeLiked], { nullable: true })
	// meLiked?: MeLiked[];
}

@ObjectType()
export class Properties {
	@Field(() => [Property])
	list: Property[];

	@Field(() => [TotalCounter])
	metaCounter: TotalCounter[];
}
