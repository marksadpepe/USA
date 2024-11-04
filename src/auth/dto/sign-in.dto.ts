import { IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignUpDto {
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
  password: string;
}
