import {  IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty } from "class-validator";

class CreateProperty {
  // @IsOptional() @IsNotEmpty() @IsString() Series: string;
  @IsString() Territory: string;
  @IsString() Purpose: string;
  @IsOptional() @IsNotEmpty() @IsString() Location: string;
  @IsOptional() @IsNotEmpty() @IsString() Attributes: string;
  @IsOptional() @IsNotEmpty() @IsBoolean() IsFurnished: boolean;
  @IsOptional() @IsNotEmpty() @IsString() Furnitures: string;
  @IsOptional() @IsNotEmpty() @IsString() Party: string;
  @IsOptional() @IsNotEmpty() @IsNumber() RequestedAmt: number;
  @IsOptional() @IsNotEmpty() @IsString() Currency: string;


}

export default CreateProperty;
