import { IsString, IsOptional, IsNotEmpty } from "class-validator";

class CreateRoles {
  @IsString() RoleName: string;


}

export default CreateRoles;
