import { Controller, Get } from '@nestjs/common';
import { LunotelBatchService } from './lunotel-batch.service';

@Controller()
export class LunotelBatchController {
  constructor(private readonly lunotelBatchService: LunotelBatchService) {}

  @Get()
  getHello(): string {
    return this.lunotelBatchService.getHello();
  }
}
