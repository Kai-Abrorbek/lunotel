import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { RoomtypeModule } from './roomtype/roomtype.module';
import { StayplanModule } from './stayplan/stayplan.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReservationModule } from './reservation/reservation.module';
import { FaqModule } from './faq/faq.module';
import { NoticeModule } from './notice/notice.module';
import { NotificationModule } from './notification/notification.module';

@Module({
	imports: [
		MemberModule,
		PropertyModule,
		RoomtypeModule,
		StayplanModule,
		InventoryModule,
		ReservationModule,
		LikeModule,
		ViewModule,
		CommentModule,
		FaqModule,
		NoticeModule,
		NotificationModule,
	],
})
export class ComponentsModule {}
