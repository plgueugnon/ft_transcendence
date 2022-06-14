import { ChannelsService } from './../channels/channels.service';
import { EChannels } from '../entities/channels.entity';
import { EMessages } from '../entities/messages.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { EChannelUsers } from '../entities/channelUsers.entity';

@Module( {
	imports: [ TypeOrmModule.forFeature( [ EMessages, EChannels, EChannelUsers ] ) ],
	providers: [ MessagesService, ChannelsService ],
	controllers: [ MessagesController ],
	exports: [ MessagesService ],
} )
export class MessagesModule { }
