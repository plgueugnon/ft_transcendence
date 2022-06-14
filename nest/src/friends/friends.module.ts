import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EFriend } from './interfaces/friend.entity';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { UsersModule } from 'src/users/users.module';

@Module( {
	imports: [ TypeOrmModule.forFeature( [ EFriend ] ), UsersModule ],
	controllers: [ FriendsController ],
	providers: [ FriendsService ],
} )
export class FriendsModule { }
