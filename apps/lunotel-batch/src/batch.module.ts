import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { PropertyModule } from 'apps/lunotel-api/src/components/property/property.module';
import { MemberModule } from 'apps/lunotel-api/src/components/member/member.module';
import { MongooseModule } from '@nestjs/mongoose';
import PropertySchema from 'apps/lunotel-api/src/schemas/Property.model';
import MemberSchema from 'apps/lunotel-api/src/schemas/Member.model';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [
		ScheduleModule.forRoot(),
		ConfigModule.forRoot(),
		DatabaseModule,
		PropertyModule,
		MemberModule,
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
	],
	controllers: [BatchController],
	providers: [BatchService],
})
export class LunotelBatchModule {}
