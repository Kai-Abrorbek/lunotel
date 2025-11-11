import { Schema } from 'mongoose';
import { InventoryStatus } from '../libs/enums/inventory.enum';

const InventorySchema = new Schema(
	{
		roomTypeId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'RoomType',
		},

		stayPlanId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'StayPlan',
		},

		inventoryDate: {
			type: String, // "2025-11-08" 같은 YYYY-MM-DD
			required: true,
		},

		inventoryAllotment: {
			type: Number,
			required: true,
			min: 0,
		},

		inventoryPrice: {
			type: Number,
			required: false,
		},

		inventoryStatus: {
			type: String,
			enum: Object.values(InventoryStatus),
			default: InventoryStatus.OPEN,
		},
	},
	{
		timestamps: true,
		collection: 'inventory',
	},
);

InventorySchema.index({ roomTypeId: 1, stayPlanId: 1, inventoryDate: 1 }, { unique: true });

export default InventorySchema;
