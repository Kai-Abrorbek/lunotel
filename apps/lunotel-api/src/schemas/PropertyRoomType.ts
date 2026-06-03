import { Schema } from 'mongoose';
import { RoomAmenity, RoomStatus } from '../libs/enums/propertyRoomtype.enum';

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

		roomMaxPersonal: {
			type: Number,
			required: true,
		},

		roomStandPersonal: {
			type: Number,
			required: true,
		},

		basePriceDayUse: {
			type: Number,
			required: true,
		},

		basePriceOvernight: {
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

		roomAmenities: {
			type: [String],
			enum: Object.values(RoomAmenity),
			required: true,
		},

		roomStatus: {
			type: String,
			enum: Object.values(RoomStatus),
			default: RoomStatus.AVAILABLE,
		},
	},
	{ timestamps: true, collection: 'roomType' },
);

RoomTypeSchema.index({ roomName: 1, roombasePrice: 1 }, { unique: true });
RoomTypeSchema.index({ propertyId: 1 });
RoomTypeSchema.index({ propertyId: 1, roomMaxPersonal: 1 });
export default RoomTypeSchema;
