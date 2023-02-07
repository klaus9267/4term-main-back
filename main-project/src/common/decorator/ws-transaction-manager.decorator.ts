import { createWsParamDecorator } from '@nestjs/websockets/utils/param.utils';
import { WsParamtype } from '@nestjs/websockets/enums/ws-paramtype.enum';
import { GetUserPipe } from '../pipes/ws-get-users.pipe';
import { GetTransactionManagerPipe } from '../pipes/ws-get-transaction.pipe';

export const WebSocketTransactionManager = () => {
  return createWsParamDecorator(WsParamtype.SOCKET)(
    new GetTransactionManagerPipe(),
  );
};
