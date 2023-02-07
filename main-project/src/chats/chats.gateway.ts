import { Logger, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common/decorators';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { Namespace, Socket } from 'socket.io';
import { WebSocketAuthGuard } from 'src/common/guards/ws-jwt-auth.guard';
import { APIResponse } from 'src/common/interface/interface';
import { ChatsGatewayService } from './chats-gateway.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { InitSocketDto } from './dto/init-socket.dto';
import { MessagePayloadDto } from './dto/message-payload.dto';
import { ChatRoom, ChatRoomWithUsers } from './interface/chat.interface';
import { WebSocketGetUser } from 'src/common/decorator/ws-get-user.decorator';
import { WebSocketTransactionManager } from 'src/common/decorator/ws-transaction-manager.decorator';
import { WebSocketTransactionInterceptor } from 'src/common/interceptor/ws-transaction-interceptor';
import { EntityManager } from 'typeorm';

@WebSocketGateway(4000, {
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3001'],
  },
})
export class ChatsGateway {
  constructor(private readonly chatGatewayService: ChatsGatewayService) {}

  private logger = new Logger('GateWay');

  @WebSocketServer() nsp: Namespace;
  afterInit() {
    this.nsp.adapter.on('init-socket', (room, id) => {
      this.logger.log(`"Socket:${id}"초기화 되었습니다.`);
    });

    this.nsp.adapter.on('join-room', (room, id) => {
      this.logger.log(`"Socket:${id}"이 "Room:${room}"에 참여하였습니다.`);
    });

    this.nsp.adapter.on('leave-room', (room, id) => {
      this.logger.log(`"Socket:${id}"이 "Room:${room}"에서 나갔습니다.`);
    });

    this.nsp.adapter.on('delete-room', (roomName) => {
      this.logger.log(`"Room:${roomName}"이 삭제되었습니다.`);
    });

    this.logger.log('웹소켓 서버 초기화');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓연결`);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓연결 해제`);
  }

  @SubscribeMessage('init-socket')
  @AsyncApiSub({
    description: `소켓 초기화 socket auth 헤더 token으로 전달 
    response: [{ roomName: string, chatRoomNo: number, users:[{userNo:number, nickname:string, profileImage:string}] }] 반환`,
    channel: 'init-socket',
    message: {
      payload: InitSocketDto,
    },
  })
  @UseGuards(WebSocketAuthGuard)
  async handleInitSocket(
    @WebSocketGetUser() userNo: number,
    @ConnectedSocket() socket: Socket,
  ): Promise<APIResponse> {
    const chatRooms = await this.chatGatewayService.initSocket(socket, userNo);

    return { response: { chatRooms } };
  }

  @SubscribeMessage('create-room')
  @AsyncApiSub({
    description: `채팅방 생성 
    response: { chatRoomNo: number } 반환`,
    channel: 'create-room',
    message: {
      payload: CreateChatDto,
    },
  })
  @UseGuards(WebSocketAuthGuard)
  @UseInterceptors(WebSocketTransactionInterceptor)
  async handleCreateRoom(
    @WebSocketGetUser() userNo: number,
    @WebSocketTransactionManager() manager: EntityManager,
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: CreateChatDto,
  ): Promise<APIResponse> {
    const chatRoom: ChatRoom = await this.chatGatewayService.createRoom(
      manager,
      socket,
      userNo,
      messagePayload,
    );

    return { response: { chatRoom } };
  }

  @SubscribeMessage('message')
  @AsyncApiSub({
    description: `
    메세지 전송 채팅일때 response: 
    { "userNo": 1,
      "chatRoomNo": 3,
      "message": 3,
    }  
    이미지일때 
    { "userNo": 1,
      "chatRoomNo": 3,
      "uploadedFileUrls": [
        "http",
        "http"
      ] 
    }반환`,
    channel: 'message',
    message: {
      payload: MessagePayloadDto,
    },
  })
  @UseGuards(WebSocketAuthGuard)
  @UseInterceptors(WebSocketTransactionInterceptor)
  async handleSendMessage(
    @WebSocketGetUser() userNo: number,
    @WebSocketTransactionManager() manager: EntityManager,
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: MessagePayloadDto,
  ): Promise<APIResponse> {
    messagePayload.hasOwnProperty('message')
      ? await this.chatGatewayService.sendChat(socket, messagePayload, userNo)
      : await this.chatGatewayService.sendFile(
          userNo,
          socket,
          messagePayload,
          manager,
        );
    return { response: { messagePayload } };
  }
}
