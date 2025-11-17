import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NotificationType } from '../../enums/notification.enum';

@InputType()
export class NotificationUpdateInput {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	title?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	message?: string;

	@IsOptional()
	@IsEnum(NotificationType)
	@Field(() => NotificationType, { nullable: true })
	type?: NotificationType;

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
