import {  IsString, IsNumber, IsDateString, IsOptional, IsNotEmpty} from "class-validator";

class CreatePayments {
  // @IsOptional()@IsNotEmpty()@IsString()Series: string; 
  @IsOptional()@IsString() PayParty: string;
  @IsOptional()@IsString() ReceiveParty: string;

  @IsDateString()PostingDate:Date;
  @IsNotEmpty()@IsString()Reference: string; 
  @IsString() Purpose: string; 
  @IsOptional()@IsNotEmpty()@IsNumber() Amount:number;
  @IsOptional()@IsNotEmpty()@IsString()Currency: string; 
  @IsOptional()@IsNotEmpty()@IsString()For: string; 
  @IsOptional()@IsNotEmpty()@IsString()Remarks: string;

}

export default CreatePayments;
