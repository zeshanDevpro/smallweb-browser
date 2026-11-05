import { Transform } from 'class-transformer';
import { IsMongoId, IsString, Length } from 'class-validator';
import { normalizeAddress } from '../../common/address';
import { IsValidAddress } from '../../common/is-valid-address.decorator';

export class CreateSiteDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeAddress(value) : value,
  )
  @IsString()
  @IsValidAddress()
  address!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 120)
  title!: string;

  @IsString()
  @Length(1, 100_000)
  body!: string;

  @IsString()
  @IsMongoId()
  authorId!: string;
}
