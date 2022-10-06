import { IsString, IsOptional, IsNotEmpty } from "class-validator";

class CreateContractTemplates {
  // @IsOptional() @IsNotEmpty()  @IsString() Series: string; 
  @IsString()
  Name: string;
  @IsString()
  Doctype: string;


}

export default CreateContractTemplates;
