import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MongooseModule } from '@nestjs/mongoose';
import InventorySchema from '../../schemas/Inventory';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Inventory', schema: InventorySchema }])],
	providers: [InventoryService],
	exports: [InventoryService],
})
export class InventoryModule {}
