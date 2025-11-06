import { Schema } from 'mongoose';
import { PropertyLocation, PropertyStatus, PropertyType } from '../libs/enums/property.enum';
import { Int } from '@nestjs/graphql';
import { RoomStatus } from '../libs/enums/propertyRoomtype.enum';

const PropertyRoomTypeSchema = new Schema(
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
		},

		roombedInfo: {
			type: String,
		},

		roomAmenities: {
			type: [String],
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

PropertyRoomTypeSchema.index({ roomName: 1, roombasePrice: 1 }, { unique: true });

export default PropertyRoomTypeSchema;
