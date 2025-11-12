import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyResolver } from './property.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import PropertySchema from '../../schemas/Property.model';
import { MemberModule } from '../member/member.module';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { LikeModule } from '../like/like.module';
import { ViewModule } from '../view/view.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Property',
				schema: PropertySchema,
			},
		]),
		MemberModule,
		AuthModule,
		InventoryModule,
		LikeModule,
		ViewModule,
	],
	providers: [PropertyService, PropertyResolver],
	exports: [PropertyService],
})
export class PropertyModule {}
