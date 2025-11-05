import { Test, TestingModule } from '@nestjs/testing';
import { LunotelBatchController } from './lunotel-batch.controller';
import { LunotelBatchService } from './lunotel-batch.service';

describe('LunotelBatchController', () => {
  let lunotelBatchController: LunotelBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LunotelBatchController],
      providers: [LunotelBatchService],
    }).compile();

    lunotelBatchController = app.get<LunotelBatchController>(LunotelBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(lunotelBatchController.getHello()).toBe('Hello World!');
    });
  });
});
