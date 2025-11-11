import { Module } from '@nestjs/common';
import { RoomtypeService } from './roomtype.service';
import { RoomtypeResolver } from './roomtype.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import RoomTypeSchema from '../../schemas/PropertyRoomType';
import { AuthModule } from '../auth/auth.module';
import { PropertyModule } from '../property/property.module';
import { StayplanModule } from '../stayplan/stayplan.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'RoomType', schema: RoomTypeSchema }]),
		AuthModule,
		PropertyModule,
		StayplanModule,
		InventoryModule,
	],
	providers: [RoomtypeService, RoomtypeResolver],
})
export class RoomtypeModule {}
