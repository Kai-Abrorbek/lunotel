import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { NotificationType } from '../../enums/notification.enum';
import { TotalCounter } from '../member/member';
import { Property } from '../property/property';

@ObjectType()
export class Notification {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => String)
	title: string;

	@Field(() => String)
	message: string;

	@Field(() => NotificationType)
	type: NotificationType;

	@Field(() => String, { nullable: true })
	reservationId?: ObjectId;

	@Field(() => String, { nullable: true })
	propertyId?: ObjectId;

	@Field(() => Boolean)
	isRead: boolean;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** FROM AGGREGATE **/
	@Field(() => Property, { nullable: true })
	propertyData?: Property;
}

@ObjectType()
export class Notifications {
	@Field(() => [Notification])
	list: Notification[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter?: TotalCounter[];
}
