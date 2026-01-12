import { Controller, Get, Inject } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(
    @Inject(AppService)
    private readonly appService: AppService,
  ) {}

  @Get("health")
  getHealth() {
    return this.appService.getHealth();
  }

  @Get("db-check")
  async getDbCheck() {
    return this.appService.getDbCheck();
  }
}
