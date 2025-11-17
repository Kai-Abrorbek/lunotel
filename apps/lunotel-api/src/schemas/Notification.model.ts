import { Schema } from 'mongoose';
import { NotificationType } from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId, // 알림 받는 사람(게스트 or 호스트)
			required: true,
			ref: 'Member',
		},

		title: {
			type: String,
			required: true,
		},

		message: {
			type: String,
			required: true,
		},

		type: {
			type: String,
			enum: NotificationType,
			required: true,
		},

		// 어떤 예약/호텔에 대한 알림인지 추적용
		reservationId: {
			type: Schema.Types.ObjectId,
			ref: 'Reservation',
		},

		propertyId: {
			type: Schema.Types.ObjectId,
			ref: 'Property',
		},

		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, collection: 'notifications' },
);

export default NotificationSchema;
