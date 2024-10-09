// Libraries
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import 'dotenv/config';

// Controllers
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';

// Modules
import { TaskModule } from '@app/modules/task/task.module';
import { GroupModule } from '@app/modules/group/group.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

// Guards
import { AuthGuard } from './modules/auth/auth.guard';

// Interceptors
import { ResponseFormatInterceptor } from './interceptors/response-format.interceptor';
import { BoardService } from './modules/board/board.service';
import { BoardController } from './modules/board/board.controller';
import { BoardModule } from './modules/board/board.module';
import { BoardUserModule } from './modules/board_user/board_user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5433,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      ssl: false,
      synchronize: true, // This should be false in production
    }),
    TaskModule,
    GroupModule,
    UserModule,
    AuthModule,
    BoardModule,
    BoardUserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
  ],
})
export class AppModule {}
