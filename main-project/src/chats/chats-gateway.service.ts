import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { Socket } from 'socket.io';
import { Boards } from 'src/boards/entity/board.entity';
import { BoardsRepository } from 'src/boards/repository/board.repository';
import { UserType } from 'src/common/configs/user-type.config';
import { EntityManager } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { MessagePayloadDto } from './dto/message-payload.dto';
import { ChatList } from './entity/chat-list.entity';
import {
  ChatRoom,
  ChatRoomBeforeCreate,
  ChatRoomOfBoard,
  ChatRoomWithUsers,
  ChatUser,
  FileUrl,
} from './interface/chat.interface';
import { ChatFileUrlsRepository } from './repository/chat-file-urls.repository';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatLogRepository } from './repository/chat-log.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';

@Injectable()
export class ChatsGatewayService {
  constructor(
    private readonly chatListRepository: ChatListRepository,
    private readonly chatUsersRepository: ChatUsersRepository,
    private readonly chatLogRepository: ChatLogRepository,
    private readonly boardRepository: BoardsRepository,
  ) {}

  async initSocket(socket, userNo: number): Promise<any> {
    const chatRooms: ChatRoomWithUsers[] = await this.getChatRooms(userNo);
    if (!chatRooms) {
      return;
    }
    chatRooms.forEach((chatRoom) => {
      socket.join(`${chatRoom.chatRoomNo}`);
    });

    return chatRooms;
  }

  async createRoom(
    manager: EntityManager,
    socket: Socket,
    userNo: number,
    messagePayload: CreateChatDto,
  ): Promise<ChatRoom> {
    const { boardNo } = messagePayload;

    await this.checkChatRoomExists(boardNo, userNo);

    const { roomName, hostsUserNo, guestsUserNo } =
      await this.getUsersByBoardNo(boardNo, userNo);
    const chatRoomNo: number = await this.createChatRoom(manager, {
      boardNo,
      roomName,
    });

    await this.setChatRoomUsers(manager, {
      users: hostsUserNo,
      userType: UserType.HOST,
      chatRoomNo,
    });

    await this.setChatRoomUsers(manager, {
      users: guestsUserNo,
      userType: UserType.GUEST,
      chatRoomNo,
    });

    socket.join(`${chatRoomNo}`);

    return { chatRoomNo, roomName };
  }

  private async setChatRoomUsers(
    manager: EntityManager,
    chatRoomUsers: ChatRoomWithUsers,
  ): Promise<void> {
    const { userType, chatRoomNo }: ChatRoomWithUsers = chatRoomUsers;
    const users = chatRoomUsers.users.split(',').map(Number);

    const chatUsers: ChatUser[] = users.reduce((values, userNo) => {
      values.push({ chatRoomNo, userNo, userType });

      return values;
    }, []);

    await this.createChatUsers(manager, chatUsers);
  }

  private async checkChatRoomExists(
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    const board: Boards = await this.boardRepository.getBoard(boardNo);
    if (!board) {
      throw new NotFoundException('게시물을 찾지 못했습니다.');
    }

    if (board.userNo !== userNo) {
      throw new BadRequestException('게시글의 작성자만 수락할 수 있습니다.');
    }

    const chatRoom: ChatList =
      await this.chatListRepository.getChatRoomByBoardNo(boardNo);
    if (chatRoom) {
      throw new BadRequestException('이미 생성된 채팅방 입니다.');
    }
  }

  async getChatRooms(userNo: number): Promise<ChatRoomWithUsers[]> {
    const rooms = await this.chatUsersRepository.getChatRoomNoByUserNo(userNo);
    if (!rooms) {
      return;
    }
    const chatRooms = JSON.parse(rooms);
    const chatRoomsWithUsers: ChatRoomWithUsers[] =
      await this.chatUsersRepository.getChatRoomsWithUsers(chatRooms);

    chatRoomsWithUsers.forEach((chatRoom) => {
      chatRoom.users = JSON.parse(chatRoom.users);
    });

    return chatRoomsWithUsers;
  }

  async sendChat(
    socket: Socket,
    messagePayload: MessagePayloadDto,
    userNo: number,
  ): Promise<void> {
    const { chatRoomNo, message }: MessagePayloadDto = messagePayload;

    await this.checkChatRoom(chatRoomNo, userNo);

    await this.saveMessage(messagePayload);

    socket.broadcast.to(`${chatRoomNo}`).emit('message', {
      message,
      userNo,
      chatRoomNo,
    });
  }

  async sendFile(
    userNo: number,
    socket: Socket,
    messagePayload: MessagePayloadDto,
    manager: EntityManager,
  ): Promise<void> {
    const { chatRoomNo, uploadedFileUrls }: MessagePayloadDto = messagePayload;

    await this.checkChatRoom(chatRoomNo, userNo);

    const chatLogNo: number = await this.saveMessageByEntityManager(
      manager,
      messagePayload,
    );

    await this.saveFileUrls(manager, messagePayload, chatLogNo);

    socket.broadcast.to(`${chatRoomNo}`).emit('message', {
      message: uploadedFileUrls,
      userNo,
      chatRoomNo,
    });
  }

  private async saveMessageByEntityManager(
    manager: EntityManager,
    messagePayload: MessagePayloadDto,
  ): Promise<number> {
    const insertId: number = await manager
      .getCustomRepository(ChatLogRepository)
      .saveMessage(messagePayload);
    if (!insertId) {
      throw new InternalServerErrorException('메세지 저장에 실패하였습니다.');
    }

    return insertId;
  }

  private async saveFileUrls(
    manager: EntityManager,
    messagePayload,
    chatLogNo,
  ): Promise<void> {
    const { uploadedFileUrls }: MessagePayloadDto = messagePayload;
    const fileUrl: FileUrl[] = uploadedFileUrls.reduce((values, fileUrl) => {
      values.push({ chatLogNo, fileUrl });

      return values;
    }, []);

    const { affectedRows }: ResultSetHeader = await manager
      .getCustomRepository(ChatFileUrlsRepository)
      .saveFileUrl(fileUrl);
    if (affectedRows !== fileUrl.length) {
      throw new InternalServerErrorException('파일 url 저장에 실패하였습니다.');
    }
  }

  private async saveMessage(messagePayload: MessagePayloadDto): Promise<void> {
    const insertId: number = await this.chatLogRepository.saveMessage(
      messagePayload,
    );
    if (!insertId) {
      throw new BadRequestException('매세지 저장 오류 입니다.');
    }
  }

  private async getUsersByBoardNo(
    boardNo: number,
    userNo: number,
  ): Promise<ChatRoomOfBoard> {
    const chatUsersOfBoard: ChatRoomOfBoard =
      await this.boardRepository.getUsersByBoardNo(boardNo, userNo);
    if (!chatUsersOfBoard) {
      throw new NotFoundException('유저 조회 오류입니다.');
    }

    const chatRoom: ChatRoomOfBoard = this.setChatRoomName(chatUsersOfBoard);

    return chatRoom;
  }

  private setChatRoomName(chatRoom: ChatRoomOfBoard): ChatRoomOfBoard {
    chatRoom.roomName = chatRoom.guestsNickname + ',' + chatRoom.hostsNickname;

    return chatRoom;
  }

  private async createChatUsers(
    manager: EntityManager,
    chatUsers: ChatUser[],
  ): Promise<number> {
    const insertResult: number = await manager
      .getCustomRepository(ChatUsersRepository)
      .createChatUsers(chatUsers);

    if (!insertResult) {
      throw new BadRequestException('채팅방 유저정보 생성 오류입니다.');
    }

    return insertResult;
  }

  private async createChatRoom(
    manager: EntityManager,
    chatRoom: ChatRoomBeforeCreate,
  ): Promise<number> {
    const createResult: number = await manager
      .getCustomRepository(ChatListRepository)
      .createChatRoom(chatRoom);
    if (!createResult) {
      throw new InternalServerErrorException(`채팅방 생성 오류입니다.`);
    }

    return createResult;
  }

  private async checkChatRoom(
    chatRoomNo: number,
    userNo: number,
  ): Promise<void> {
    const chatRoom: ChatList = await this.chatListRepository.getChatRoomByNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new NotFoundException(`해당 채팅방이 존재하지 않습니다.`);
    }

    const user: ChatUser = await this.chatListRepository.getUser(
      chatRoomNo,
      userNo,
    );
    if (!user) {
      throw new BadRequestException('채팅방에 유저의 정보가 없습니다.');
    }
  }
}
