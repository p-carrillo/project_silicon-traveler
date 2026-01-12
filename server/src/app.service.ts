import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  getHealth() {
    return { status: "ok" };
  }

  async getDbCheck() {
    try {
      await this.dataSource.query("SELECT 1");
      return { status: "ok" };
    } catch (error) {
      return { status: "error", message: String(error) };
    }
  }
}
