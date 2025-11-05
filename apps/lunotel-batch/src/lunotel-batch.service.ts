import { Injectable } from '@nestjs/common';

@Injectable()
export class LunotelBatchService {
  getHello(): string {
    return 'Hello World! Batch';
  }
}
