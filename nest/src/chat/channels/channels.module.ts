import { EmailsService } from 'src/emails/emails.service';
import { UsersService } from 'src/users/users.service';
import { EChannels } from '../entities/channels.entity';
import { EMessages } from '../entities/messages.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { EUser } from 'src/users/interfaces/user.entity';
import { EChannelUsers } from '../entities/channelUsers.entity';

@Module( {
	imports: [ TypeOrmModule.forFeature( [ EUser, EMessages, EChannels, EChannelUsers ] ) ],
	providers: [ ChannelsService, UsersService, EmailsService ],
	controllers: [ ChannelsController ],
	exports: [ ChannelsService ],
} )
export class ChannelsModule { }
