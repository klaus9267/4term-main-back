import { createWsParamDecorator } from '@nestjs/websockets/utils/param.utils';
import { WsParamtype } from '@nestjs/websockets/enums/ws-paramtype.enum';
import { GetUserPipe } from '../pipes/ws-get-users.pipe';

export const WebSocketGetUser = () => {
  return createWsParamDecorator(WsParamtype.SOCKET)(new GetUserPipe());
};
