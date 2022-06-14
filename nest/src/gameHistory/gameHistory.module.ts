import { EmailsService } from 'src/emails/emails.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EUser } from 'src/users/interfaces/user.entity';
import { UsersService } from 'src/users/users.service';
import { GameHistoryController } from './gameHistory.controller';
import { EGameHistory } from './gameHistory.entity';
import { GameHistoryService } from './gameHistory.service';

@Module( {
	imports: [ TypeOrmModule.forFeature( [ EUser, EGameHistory ] ) ],
	providers: [ UsersService, GameHistoryService, EmailsService ],
	controllers: [ GameHistoryController ],
	exports: [ GameHistoryService ],
} )
export class GameHistoryModule { }
