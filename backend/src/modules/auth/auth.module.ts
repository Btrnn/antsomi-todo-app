// Libraries
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Services
import { AuthService } from './auth.service';

// Controllers
import { AuthController } from './auth.controller';

// Modules
import { UserModule } from '@app/modules/user/user.module';

// Constants
import { jwtConstants } from './constants';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
