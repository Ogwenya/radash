import { Test, TestingModule } from '@nestjs/testing';
import { NasService } from './nas.service';

describe('NasService', () => {
  let service: NasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NasService],
    }).compile();

    service = module.get<NasService>(NasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
