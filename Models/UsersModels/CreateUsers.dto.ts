import { IsString, IsBoolean, IsDateString, IsOptional, IsNotEmpty, Matches, MinLength, MaxLength } from "class-validator";

class Users {
  @IsString() FullName: string;
  @IsString() UserName: string;
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password is too weak must have capital and small letter ' })
  Password: string;
  @IsOptional() @IsNotEmpty() @IsString() Language: string;
  @IsString() RoleID: string;
  @IsOptional() @IsNotEmpty() @IsDateString() FromDate: Date;
  @IsOptional() @IsNotEmpty() @IsDateString() ToDate: Date;
  @IsOptional() @IsNotEmpty() @IsString() Branch: string;
  @IsOptional() @IsNotEmpty() @IsBoolean() Disabled: boolean;

}

export default Users;
