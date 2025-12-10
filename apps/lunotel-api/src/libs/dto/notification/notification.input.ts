import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NotificationType } from '../../enums/notification.enum';

@InputType()
export class NotificationInput {
	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	refMemberId?: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	title: string;

	@IsNotEmpty()
	@Field(() => String)
	message: string;

	@IsNotEmpty()
	@IsEnum(NotificationType)
	@Field(() => NotificationType)
	type: NotificationType;

	@IsOptional()
	@Field(() => String, { nullable: true })
	reservationId?: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	propertyId?: ObjectId;

	@IsOptional()
	@IsBoolean()
	@Field(() => Boolean, { nullable: true })
	isRead?: boolean;
}

@InputType()
export class NTSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

	@IsOptional()
	@Field(() => NotificationType, { nullable: true })
	type?: NotificationType;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	isRead?: boolean;
}

@InputType()
export class NotificationsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => NTSearch, { nullable: true })
	search?: NTSearch;
}
