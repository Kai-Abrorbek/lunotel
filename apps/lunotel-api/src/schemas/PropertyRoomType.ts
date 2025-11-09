import { Schema } from 'mongoose';
import { RoomStatus } from '../libs/enums/propertyRoomtype.enum';

const RoomTypeSchema = new Schema(
	{
		propertyId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Property',
		},

		roomName: {
			type: String,
			required: true,
		},

		roomCapacity: {
			type: Number,
			required: true,
		},

		roombasePrice: {
			type: Number,
			required: true,
		},

		roomDiscountPrice: {
			type: Number,
			required: false,
			min: 0,
			default: 0,
		},

		roombedInfo: {
			type: String,
			default: '',
		},

		roomImages: {
			type: [String],
			required: true,
		},

		roomStatus: {
			type: String,
			enum: Object.values(RoomStatus),
			default: RoomStatus.DRAFT,
		},
	},
	{ timestamps: true, collection: 'roomType' },
);

RoomTypeSchema.index({ roomName: 1, roombasePrice: 1 }, { unique: true });

export default RoomTypeSchema;
