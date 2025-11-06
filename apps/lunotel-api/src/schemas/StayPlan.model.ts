import { Schema } from 'mongoose';
import { StayPlanStatus, StayPlanType } from '../libs/enums/stayplan.enum';

const StayPlanSchema = new Schema(
	{
		roomTypeId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'roomType',
		},

		stayPlanType: {
			type: String,
			enum: Object.values(StayPlanType),
			required: true,
		},

		stayPlanName: {
			type: String,
			required: true,
		},

		stayPlanBasePrice: {
			type: Number,
			required: true,
		},

		stayPlanRules: {
			type: Object,
			required: true,
		},

		stayPlanstatus: {
			type: String,
			enum: Object.values(StayPlanStatus),
			default: StayPlanStatus.ACTIVE,
		},
	},
	{ timestamps: true, collection: 'stayPlan' },
);

export default StayPlanSchema;
