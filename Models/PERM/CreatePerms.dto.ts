import {  IsString, IsBoolean, IsOptional, IsNotEmpty } from "class-validator";

class CreatePerms {
  @IsString() RoleSeries: string;
}

export default CreatePerms;
