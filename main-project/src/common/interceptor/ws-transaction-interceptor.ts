import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { Connection } from 'typeorm';

@Injectable()
export class WebSocketTransactionInterceptor implements NestInterceptor {
  constructor(private connection: Connection) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const socket = context.switchToWs();
    const request = socket.getClient().handshake;
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();

    request.manager = queryRunner.manager;

    return next.handle().pipe(
      catchError(async (err) => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        if (err instanceof HttpException) {
          throw new HttpException(err.getResponse(), err.getStatus());
        } else {
          throw new InternalServerErrorException(err);
        }
      }),

      tap(async () => {
        await queryRunner.commitTransaction();
        await queryRunner.release();
      }),
    );
  }
}
