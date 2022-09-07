import {  IsString,IsOptional,IsNotEmpty} from "class-validator";

class CreatePropertyAttr {
  // @IsOptional() @IsNotEmpty() @IsString()Series: string; 
  @IsString() Attribute: string;


}

export default CreatePropertyAttr;
