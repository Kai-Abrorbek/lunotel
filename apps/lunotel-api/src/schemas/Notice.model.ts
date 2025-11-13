import { Schema } from 'mongoose';
import { NoticeCategory } from '../libs/enums/notice.enum';

const NoticeSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},

		content: {
			type: String,
			required: true,
		},

		category: {
			type: String,
			enum: NoticeCategory,
			required: true,
		},

		isPinned: {
			type: Boolean,
			default: false,
		},

		views: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true, collection: 'notices' },
);

export default NoticeSchema;
