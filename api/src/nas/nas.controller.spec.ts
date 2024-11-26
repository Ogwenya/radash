import { Test, TestingModule } from '@nestjs/testing';
import { NasController } from './nas.controller';
import { NasService } from './nas.service';

describe('NasController', () => {
  let controller: NasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NasController],
      providers: [NasService],
    }).compile();

    controller = module.get<NasController>(NasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
