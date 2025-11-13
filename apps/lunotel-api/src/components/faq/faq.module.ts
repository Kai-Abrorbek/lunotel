import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqResolver } from './faq.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import FaqSchema from '../../schemas/Faq.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'FaqSchema', schema: FaqSchema }]), AuthModule],
	providers: [FaqService, FaqResolver],
	exports: [FaqService],
})
export class FaqModule {}
