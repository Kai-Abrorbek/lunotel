import { Module } from '@nestjs/common';
import { StayplanService } from './stayplan.service';
import { MongooseModule } from '@nestjs/mongoose';
import StayPlanSchema from '../../schemas/StayPlan.model';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'StayPlan', schema: StayPlanSchema }])],
	providers: [StayplanService],
	exports: [StayplanService],
})
export class StayplanModule {}
