import {  IsString, IsBoolean, IsOptional, IsNotEmpty } from "class-validator";

class CreatePermission {
  // @IsOptional() @IsNotEmpty() @IsString() Series: string;
  @IsString() RoleSeries: string;
  // @IsString() DocTypeID: string;
  @IsOptional() @IsNotEmpty() @IsBoolean() Read: boolean;
  @IsOptional() @IsNotEmpty() @IsBoolean() Write: boolean;
  @IsOptional() @IsNotEmpty() @IsBoolean() Create: boolean;
  @IsOptional() @IsNotEmpty() @IsBoolean() Delete: boolean;


}

export default CreatePermission;
