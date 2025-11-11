import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyResolver } from './property.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import PropertySchema from '../../schemas/Property.model';
import { MemberModule } from '../member/member.module';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import RoomTypeSchema from '../../schemas/PropertyRoomType';
import StayPlanSchema from '../../schemas/StayPlan.model';
import InventorySchema from '../../schemas/Inventory';
import MemberSchema from '../../schemas/Member.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Property',
				schema: PropertySchema,
			},
		]),

		MongooseModule.forFeature([
			{
				name: 'Member',
				schema: MemberSchema,
			},
		]),

		MongooseModule.forFeature([
			{
				name: 'RoomType',
				schema: RoomTypeSchema,
			},
		]),
		MongooseModule.forFeature([
			{
				name: 'StayPlan',
				schema: StayPlanSchema,
			},
		]),
		MongooseModule.forFeature([
			{
				name: 'Inventory',
				schema: InventorySchema,
			},
		]),
		MemberModule,
		AuthModule,
		InventoryModule,
	],
	providers: [PropertyService, PropertyResolver],
	exports: [PropertyService],
})
export class PropertyModule {}
