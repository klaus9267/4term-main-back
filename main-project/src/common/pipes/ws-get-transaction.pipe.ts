import { Injectable, PipeTransform, Type } from '@nestjs/common';

@Injectable()
export class GetTransactionManagerPipe implements PipeTransform {
  transform(request: any) {
    return request.handshake.manager;
  }
}
