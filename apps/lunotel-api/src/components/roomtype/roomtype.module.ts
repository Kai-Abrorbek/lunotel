import { Module } from '@nestjs/common';
import { RoomtypeService } from './roomtype.service';
import { RoomtypeResolver } from './roomtype.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import RoomTypeSchema from '../../schemas/PropertyRoomType';
import { AuthModule } from '../auth/auth.module';
import { PropertyModule } from '../property/property.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'RoomType', schema: RoomTypeSchema }]), AuthModule, PropertyModule],
	providers: [RoomtypeService, RoomtypeResolver],
})
export class RoomtypeModule {}
