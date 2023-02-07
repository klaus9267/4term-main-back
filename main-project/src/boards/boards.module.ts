import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsRepository } from 'src/friends/repository/friends.repository';
import { NoticeBoardsRepository } from 'src/notices/repository/notices-board.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { UsersRepository } from 'src/users/repository/users.repository';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { BoardBookmarksRepository } from './repository/board-bookmark.repository';
import { BoardGuestsRepository } from './repository/board-guest.repository';
import { BoardHostsRepository } from './repository/board-host.repository';
import { BoardsRepository } from './repository/board.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoardsRepository,
      BoardGuestsRepository,
      BoardHostsRepository,
      BoardBookmarksRepository,
      UsersRepository,
      NoticesRepository,
      NoticeBoardsRepository,
      FriendsRepository,
    ]),
  ],
  providers: [BoardsService],
  controllers: [BoardsController],
})
export class BoardsModule {}
