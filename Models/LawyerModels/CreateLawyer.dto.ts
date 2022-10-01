import {  IsString, IsPhoneNumber, IsOptional, IsNotEmpty, IsBoolean} from "class-validator";

class CreateLawyer {
  // @IsOptional() @IsNotEmpty() @IsString()Series: string; 
  @IsString()
  FullName: string;
  @IsOptional() @IsNotEmpty () @IsPhoneNumber()
  Phone: string;
  @IsOptional() @IsNotEmpty()@IsPhoneNumber()
  Cell: string;
  @IsOptional() @IsNotEmpty() @IsString()
  Address: string;
  @IsOptional() @IsNotEmpty() @IsBoolean()  Gender:boolean;
  @IsOptional() @IsNotEmpty() @IsString()
  Remarks: string;


}

export default CreateLawyer;
