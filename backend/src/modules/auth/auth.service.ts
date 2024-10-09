// Libraries
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ServiceResponse } from '@app/types';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Services
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    password: string,
  ): Promise<ServiceResponse<string>> {
    const user = await this.userService.findByUsername(username);
    if (user.data) {
      const isMatch = await bcrypt.compare(password, user.data.password);
      if (!isMatch) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            statusMessage: 'Wrong password or username!',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const payload = {
        id: user.data.id,
        role: user.data.role,
      };
      const accessToken = await this.jwtService.signAsync(payload);
      return { data: accessToken, meta: {} };
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        statusMessage: 'Wrong password or username!',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
