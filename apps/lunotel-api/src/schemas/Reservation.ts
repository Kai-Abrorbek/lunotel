import { Schema } from 'mongoose';
import { ReservationStatus } from '../libs/enums/reservation';

const ReservationSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},

		propertyId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Hotel',
		},

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

		reservationStatus: {
			type: String,
			enum: Object.values(ReservationStatus),
			default: ReservationStatus.PENDING,
		},

		reservationQty: {
			type: Number,
			required: true,
			min: 1,
		},

		// ✅ 가격은 예약 시점에 “고정 저장”
		priceBreakdown: {
			type: [
				{
					date: { type: String, required: true }, // YYYY-MM-DD
					unitPrice: { type: Number, required: true },
					qty: { type: Number, required: true },
					subtotal: { type: Number, required: true },
				},
			],
			required: true,
		},

		reservationTotalPrice: {
			type: Number,
			required: true,
		},

		// ✅ Overnight 전용
		reservationCheckIn: {
			type: String, // YYYY-MM-DD
		},

		reservationCheckOut: {
			type: String, // YYYY-MM-DD
		},

		// ✅ DayUse 전용
		reservationDate: {
			type: String, // YYYY-MM-DD
		},

		reservationCheckInAt: {
			type: String, // "15:00"
		},

		reservationCheckOutAt: {
			type: String,
		},
	},
	{ timestamps: true, collection: 'reservation' },
);

// 자주 쓰는 조회 패턴
ReservationSchema.index({ memberId: 1, createdAt: -1 });
ReservationSchema.index({ propertyId: 1, reservationDate: 1 });
ReservationSchema.index({ roomTypeId: 1, reservationCheckIn: 1 });

export default ReservationSchema;
