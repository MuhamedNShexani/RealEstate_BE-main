import {  IsString, IsBoolean, IsOptional, IsNotEmpty } from "class-validator";

class CreateCurrency {
  // @IsOptional() @IsNotEmpty() @IsString() Series: string;
  @IsString() CurrencyName: string;
  @IsOptional() @IsNotEmpty() @IsString() Symbol: string;
  @IsOptional() @IsNotEmpty() @IsString() Format: string;
  @IsOptional() @IsNotEmpty() @IsBoolean() Enabled: boolean;
  @IsOptional() @IsNotEmpty() @IsBoolean() Default: boolean;

}

export default CreateCurrency;
