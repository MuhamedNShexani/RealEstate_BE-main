import { IsString, IsBoolean, IsOptional, IsNotEmpty } from "class-validator";

class CreateBranches {
  @IsString() BranchName: string;
  @IsOptional() @IsNotEmpty() @IsBoolean() isGroup: boolean;
  @IsOptional() @IsNotEmpty() @IsString() ParentBranch: string;

}

export default CreateBranches;
