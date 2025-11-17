import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationResolver } from './reservation.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import ReservationSchema from '../../schemas/Reservation';
import { AuthModule } from '../auth/auth.module';
import StayPlanSchema from '../../schemas/StayPlan.model';
import RoomTypeSchema from '../../schemas/PropertyRoomType';
import { NotificationModule } from '../notification/notification.module';
import PropertySchema from '../../schemas/Property.model';
import { MemberModule } from '../member/member.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Reservation', schema: ReservationSchema }]),
		MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }]),
		MongooseModule.forFeature([{ name: 'RoomType', schema: RoomTypeSchema }]),
		MongooseModule.forFeature([{ name: 'StayPlan', schema: StayPlanSchema }]),
		MongooseModule.forFeature([{ name: 'Inventory', schema: ReservationSchema }]),
		AuthModule,
		NotificationModule,
		MemberModule,
	],
	providers: [ReservationService, ReservationResolver],
})
export class ReservationModule {}
