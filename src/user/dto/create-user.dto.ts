import { IsString, Length } from "class-validator";

export class CreateUserDto {
  @IsString()
  @Length(4, 400)
  fullName: string;

  @IsString()
  @Length(4, 255)
  username: string;

  @IsString()
  @Length(4, 255)
  // NOTE: the IsStringPassword decorator will be useful here in the "real" projects
  password: string;
}
