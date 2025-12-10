import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import { NotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { Message } from '../../libs/enums/common.enum';
import { NotificationUpdateInput } from '../../libs/dto/notification/notification.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { T } from '../../libs/types/common';

@Injectable()
export class NotificationService {
	constructor(@InjectModel('Notification') private readonly notificationModel: Model<Notification>) {}

	public async createNotification(input: NotificationInput): Promise<Notification> {
		try {
			const result: Notification = await this.notificationModel.create(input);
			return result;
		} catch (err) {
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async updateNotification(input: NotificationUpdateInput, memberId: ObjectId): Promise<Notification> {
		const notificationId = shapeIntoMongoObjectId(input._id);
		const result = await this.notificationModel.findOneAndUpdate({ _id: notificationId }, input, { new: true }).exec();

		if (!result) throw new BadRequestException(Message.UPDATE_FAILED);
		return result;
	}

	public async getMyNotifications(input: NotificationsInquiry, memberId: ObjectId): Promise<Notifications> {
		const { limit, page, search } = input;
		const match: T = { memberId: memberId };
		if (search.memberId) match.memberId = search.memberId;
		if (search.type) match.type = search.type;

		const result = await this.notificationModel.aggregate([
			{ $match: match },
			{ $sort: { createdAt: -1 } },
			{
				$facet: {
					list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);

		if (!result.length) throw new BadGatewayException(Message.NO_DATA_FOUND);

		return result[0];
	}
}
