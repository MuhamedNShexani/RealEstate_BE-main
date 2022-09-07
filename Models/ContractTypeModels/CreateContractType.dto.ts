import {  IsString, IsOptional, IsNotEmpty } from "class-validator";

class CreateContractType {
   // @IsOptional() @IsNotEmpty() @IsString() Series: string;
   @IsString() ContractType: string;


}

export default CreateContractType;
