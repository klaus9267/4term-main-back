import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class WebSocketAuthGuard extends AuthGuard('web-socket-jwt') {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const socket = context.switchToWs().getClient().handshake;

    return socket;
  }
}
