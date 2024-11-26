import { Test, TestingModule } from '@nestjs/testing';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';

describe('AccountingController', () => {
  let controller: AccountingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountingController],
      providers: [AccountingService],
    }).compile();

    controller = module.get<AccountingController>(AccountingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
