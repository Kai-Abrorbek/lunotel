import { Schema } from 'mongoose';
import {
	PropertyAmenity,
	PropertyLocation,
	PropertyOtherAmenity,
	PropertyStatus,
	PropertyType,
} from '../libs/enums/property.enum';

const PropertySchema = new Schema(
	{
		propertyType: {
			type: String,
			enum: PropertyType,
			required: true,
		},

		propertyStatus: {
			type: String,
			enum: PropertyStatus,
			default: PropertyStatus.DRAFT,
		},

		propertyLocation: {
			type: String,
			enum: PropertyLocation,
			required: true,
		},

		propertyAddress: {
			type: String,
			required: true,
		},

		propertyDetailAddress: {
			type: String,
			required: true,
		},

		propertyLat: {
			type: String,
			required: true,
		},

		propertyLng: {
			type: String,
			required: true,
		},

		propertyName: {
			type: String,
			required: true,
		},

		propertyPrice: {
			type: Number,
			default: 0,
		},

		propertyRooms: {
			type: Number,
			default: 0,
		},

		propertyViews: {
			type: Number,
			default: 0,
		},

		propertyReservations: {
			type: Number,
			default: 0,
		},

		propertyLikes: {
			type: Number,
			default: 0,
		},

		propertyComments: {
			type: Number,
			default: 0,
		},

		propertyRank: {
			type: Number,
			default: 0,
		},

		propertyStars: {
			type: Number,
			default: 0,
		},

		propertyImages: {
			type: [String],
			required: true,
		},

		propertyAmenities: {
			type: [String],
			enum: [PropertyAmenity],
		},

		propertyOtherAmenities: {
			type: [String],
			enum: [PropertyOtherAmenity],
		},

		propertyDesc: {
			type: String,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, collection: 'properties' },
);

PropertySchema.index({ propertyType: 1, propertyLocation: 1, propertyName: 1 }, { unique: true });
PropertySchema.index({ propertyStatus: 1, propertyType: 1 });
PropertySchema.index({ propertyStatus: 1, propertyLikes: -1 });
PropertySchema.index({ propertyStatus: 1, createdAt: -1 });
PropertySchema.index({ propertyStatus: 1, propertyLocation: 1 });
export default PropertySchema;
