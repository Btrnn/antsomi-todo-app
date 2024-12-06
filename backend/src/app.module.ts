// Libraries
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import 'dotenv/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Controllers
import { UserController } from './modules/user/user.controller';
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';

// Modules
import { TaskModule } from '@app/modules/task/task.module';
import { GroupModule } from '@app/modules/group/group.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { BoardModule } from './modules/board/board.module';
import { CommentModule } from './modules/comment/comment.module';
import { FileModule } from './modules/file/file.module';
import { ShareAccessModule } from './modules/share_access/share_access.module';

// Guards
import { AuthGuard } from './modules/auth/auth.guard';

// Interceptors
import { ResponseFormatInterceptor } from './interceptors/response-format.interceptor';
import { UserService } from './modules/user/user.service';
import { NotificationGateway } from './modules/notification/notification.gateway';
import { NotificationController } from './modules/notification/notification.controller';
import { NotificationModule } from './modules/notification/notification.module';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TaskModule,
    GroupModule,
    UserModule,
    AuthModule,
    BoardModule,
    ShareAccessModule,
    CaslModule,
    FileModule,
    CommentModule,
    NotificationModule,
  ],
  controllers: [AppController, UserController],
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
