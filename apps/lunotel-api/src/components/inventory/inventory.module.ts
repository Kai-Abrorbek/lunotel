import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryResolver } from './inventory.resolver';
import InventorySchema from '../../schemas/Inventory';
import { AuthModule } from '../auth/auth.module';
import StayPlanSchema from '../../schemas/StayPlan.model';
import RoomTypeSchema from '../../schemas/PropertyRoomType';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Inventory', schema: InventorySchema }]),
		MongooseModule.forFeature([{ name: 'StayPlan', schema: StayPlanSchema }]),
		MongooseModule.forFeature([{ name: 'RoomType', schema: RoomTypeSchema }]),
		AuthModule,
	],
	providers: [InventoryService, InventoryResolver],
	exports: [InventoryService],
})
export class InventoryModule {}
