import { IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "John Doe", description: "User's full name" })
  @IsString()
  @Length(4, 400)
  fullName: string;

  @ApiProperty({ example: "johndoe", description: "User's username" })
  @IsString()
  @Length(4, 255)
  username: string;

  @ApiProperty({
    example: "johndoepassword1234",
    description: "User's password",
  })
  @IsString()
  @Length(4, 255)
  // NOTE: the IsStringPassword decorator will be useful here in the "real" projects
  password: string;
}
