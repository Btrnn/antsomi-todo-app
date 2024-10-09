import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((responseData) => {
        const { data, meta } = responseData || {};

        // Retrieve status code from the response, default to 200 if not set
        const statusCode = response.statusCode || HttpStatus.OK;
        const statusMessage = HttpStatus[statusCode];

        return {
          statusCode,
          statusMessage,
          data,
          meta,
        };
      }),
      // catchError((err) => {
      //   return throwError(
      //     () =>
      //       new HttpException(
      //         {
      //           status: HttpStatus.CONFLICT,
      //           message:
      //             'The email or phone number you entered is already in use. Please try a different one.',
      //         },
      //         HttpStatus.CONFLICT,
      //       ),
      //   );
      // }),
    );
  }
}
