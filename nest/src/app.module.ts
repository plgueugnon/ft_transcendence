import { EGameHistory } from './gameHistory/gameHistory.entity';
import { EChannelUsers } from './chat/entities/channelUsers.entity';
import { EChannels } from './chat/entities/channels.entity';
import { EMessages } from './chat/entities/messages.entity';
import { Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EUser } from './users/interfaces/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { SocketsModule } from './sockets/sockets.module';

import { MessagesModule } from './chat/messages/messages.module';
import { ChannelsModule } from './chat/channels/channels.module';

import { EFriend } from './friends/interfaces/friend.entity';
import { FriendsModule } from './friends/friends.module';
import { ETwoFA } from './auth/interfaces/twofa.entity';
import { EBlock } from './block/interfaces/block.entity';
import { BlocksModule } from './block/blocks.module';
import { GameHistoryModule } from './gameHistory/gameHistory.module';

@Module( {
	imports: [
		TypeOrmModule.forRoot( {
			type: 'postgres',
			host: 'db-server',
			port: parseInt( process.env.DB_PORT ),
			username: 'sCtZ2Ufe',
			password: '8NzXrwuq',
			database: 'data',
			entities: [ EUser, EFriend, ETwoFA, EMessages, EChannels, EChannelUsers, EBlock, EGameHistory ],
			synchronize: true,
		} ),
		UsersModule,
		AuthModule,
		MessagesModule,
		ChannelsModule,
		SocketsModule,
		FriendsModule,
		BlocksModule,
		GameHistoryModule,
	],
	controllers: [ AppController ],
} )
export class AppModule implements NestModule {
	configure() { }
}
