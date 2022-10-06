import { IsString, IsNotEmpty, IsNumber, IsDateString } from "class-validator";

class CreateCurrency {
  //  @IsNotEmpty() @IsString() Series: string;
  @IsDateString() Date: string;
  @IsNotEmpty() @IsString() FromCurrency: string;
  @IsNotEmpty() @IsString() ToCurrency: string;
  @IsNotEmpty() @IsNumber() RateExchange: boolean;

}

export default CreateCurrency;
