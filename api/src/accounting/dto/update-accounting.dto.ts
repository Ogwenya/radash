import { PartialType } from '@nestjs/swagger';
import { CreateAccountingDto } from './create-accounting.dto';

export class UpdateAccountingDto extends PartialType(CreateAccountingDto) {}
