import { IsString, Length } from "class-validator";

export class SignUpDto {
  @IsString()
  @Length(4, 255)
  username: string;

  @IsString()
  @Length(4, 255)
  password: string;
}
