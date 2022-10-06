import {  IsString, IsNumber, IsBoolean, IsDateString, IsOptional, IsNotEmpty } from "class-validator";

class CreateContracts {

  @IsDateString() ContractDate: Date;
  @IsString() FirstParty: string;
  @IsString() SecondParty: string;
  // @IsOptional() @IsNotEmpty() @IsString() Series: string;
  @IsString() Property: string;
  @IsOptional() @IsNotEmpty() @IsNumber() MethodOfPayment: number;
  @IsOptional() @IsNotEmpty() @IsString() TypeOfTran: string;
  @IsOptional() @IsNotEmpty() @IsNumber() InsuranceAmt: number
  @IsOptional() @IsNotEmpty() @IsDateString() ContractStarts: Date;
  @IsOptional() @IsNotEmpty() @IsDateString() ContractEnds: Date;
  @IsOptional() @IsNotEmpty() @IsDateString() HandoverDate: Date;
  @IsOptional() @IsNotEmpty() @IsNumber() RequestedAmt: number
  @IsOptional() @IsNotEmpty() @IsNumber() PaidAmt: number;
  // @IsOptional()  @IsString() PaidCurrency: string
  // @IsOptional()  @IsString() RentCurrency: string
  // @IsOptional() @IsNumber() RentFor: number
//  @IsNotEmpty() @IsString() RentCurrency: string
  @IsOptional() @IsNotEmpty() @IsNumber() AdvanceAmt: number
  @IsOptional() @IsNotEmpty() @IsString() AdvanceCurrency: string
  @IsOptional() @IsNotEmpty() @IsString() InsuranceCurrency: string
  @IsOptional() @IsNotEmpty() @IsBoolean() IsFurnished: boolean
  // @IsOptional() @IsNotEmpty() @IsString() Furnitures: string
  @IsOptional() @IsNotEmpty() @IsString() Remarks: string
  // @IsOptional() @IsNotEmpty() @IsString() ExtraPayment: string
  @IsOptional() @IsNotEmpty() @IsString() Lawyer: string

}

export default CreateContracts;
