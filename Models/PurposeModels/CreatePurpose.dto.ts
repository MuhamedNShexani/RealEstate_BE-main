import {  IsString, IsNumber ,IsBoolean, IsOptional, IsNotEmpty} from "class-validator";

class CreatePurpose {
  // @IsOptional()@IsNotEmpty()@IsString()Series: string; 
  @IsString()Purpose: string; 
  @IsOptional()@IsNotEmpty()@IsBoolean()IsPayable:boolean;
  @IsOptional()@IsNotEmpty()@IsNumber()DefaultAmt:number
  @IsOptional()@IsNotEmpty()@IsString()DefaultCurrency: string; 

}

export default CreatePurpose;
