import { Args, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Notification } from '../../libs/dto/notification/notification';
import { UseGuards } from '@nestjs/common';
import { WithoutGuard } from '../auth/guards/without.guard';
import { NotificationUpdateInput } from '../../libs/dto/notification/notification.update';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(WithoutGuard)
	@Query(() => Notification)
	public async updateNotification(
		@Args('input') input: NotificationUpdateInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.notificationService.updateNotification(input, memberId);
	}
}
