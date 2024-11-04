import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("app")
@Controller("app")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Ping the app" })
  @ApiResponse({
    status: 200,
    description: "The app is working",
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error",
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
