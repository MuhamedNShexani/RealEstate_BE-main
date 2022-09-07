import {  IsString ,IsBoolean, IsNotEmpty, IsOptional} from "class-validator";

class CreateTerritory {
  // @IsOptional() @IsNotEmpty() @IsString() Series: string;
  @IsString() Territory: string;
  @IsOptional() @IsNotEmpty() @IsString() Parent: string;
   @IsOptional() @IsNotEmpty() @IsBoolean()  isGroup:boolean;

}

export default CreateTerritory;
