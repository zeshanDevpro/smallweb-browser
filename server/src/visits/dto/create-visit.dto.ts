import { Transform } from 'class-transformer';
import { Allow, IsIn, IsString } from 'class-validator';
import { normalizeAddressInput } from '../../common/address';
import { IsValidAddress } from '../../common/is-valid-address.decorator';
import { visitViaValues, type Via } from '../../common/via';

export class CreateVisitDto {
  @Transform(({ value }) => normalizeAddressInput(value))
  @IsString()
  @IsValidAddress()
  address!: string;

  @IsIn(visitViaValues)
  via!: Via;

  @Allow()
  found?: unknown;
}
