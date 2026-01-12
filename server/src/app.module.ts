import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PostModule } from "./modules/post/post.module";
import { JourneyModule } from "./modules/journey/journey.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'app',
      entities: [__dirname + '/**/*.typeorm-entity{.ts,.js}'],
      synchronize: false,
    }),
    PostModule,
    JourneyModule,
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
