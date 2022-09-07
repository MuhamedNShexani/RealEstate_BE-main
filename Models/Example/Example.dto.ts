import { Length, IsString, IsNumber } from "class-validator";

class CreateExampleDto {
  @IsString()
  Series: string;
  @IsString()
  Example: string;
  @IsNumber()
  ConverstionFactor: number;
}

export default CreateExampleDto;
