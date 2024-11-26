import { PartialType } from '@nestjs/swagger';
import { CreateNaDto } from './create-na.dto';

export class UpdateNaDto extends PartialType(CreateNaDto) {}
