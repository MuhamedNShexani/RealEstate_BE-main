import {  IsString, IsOptional, IsNotEmpty} from "class-validator";

class CreatePropertyType {
  // @IsOptional() @IsNotEmpty() @IsString()Series: string; 
  @IsString() TypeName: string; 

}

export default CreatePropertyType;
