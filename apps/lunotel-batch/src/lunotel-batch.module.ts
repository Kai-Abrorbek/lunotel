import { Module } from '@nestjs/common';
import { LunotelBatchController } from './lunotel-batch.controller';
import { LunotelBatchService } from './lunotel-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [LunotelBatchController],
  providers: [LunotelBatchService],
})
export class LunotelBatchModule {}
