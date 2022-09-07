import {  IsString, IsPhoneNumber, IsOptional, IsNotEmpty, IsBoolean} from "class-validator";

class CreateParty {
  // @IsOptional() @IsNotEmpty() @IsString()Series: string; 
  @IsString()
  FullName: string;
  @IsOptional() @IsNotEmpty () @IsPhoneNumber()
  Phone: number;
  @IsOptional() @IsNotEmpty()@IsPhoneNumber()
  Cell: number;
  @IsOptional() @IsNotEmpty() @IsString()
  Address: string;
  @IsOptional() @IsNotEmpty() @IsBoolean()  Gender:boolean;
  @IsOptional() @IsNotEmpty() @IsString()
  Remarks: string;


}

export default CreateParty;
