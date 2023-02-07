import { Injectable, PipeTransform, Type } from '@nestjs/common';

@Injectable()
export class GetUserPipe implements PipeTransform {
  transform(socket: any) {
    return socket.handshake.user;
  }
}
