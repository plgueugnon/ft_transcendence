import { Controller, Get, Post, UseGuards, Req, BadRequestException, UnauthorizedException, Delete, Param, Query, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EUser } from 'src/users/interfaces/user.entity';
import { IUsersPublic } from 'src/users/interfaces/usersPublic.interface';
import { UsersService } from 'src/users/users.service';
import { ConnectionNotFoundError } from 'typeorm';
import { FriendsService } from './friends.service';
import { EFriend } from './interfaces/friend.entity';
import { IFriendInvite } from './interfaces/friendInvite.interface';

@Controller( 'friends' )
export class FriendsController {
	constructor( private friendsService: FriendsService, private usersService: UsersService ) { }

	//? GET DATA

	// @Get( '/relations' ) // TODO Set up a get to all relations and replace calls to isSent, isFriend, ... in userPublicProfile to a simple parse of get all relations
	// @UseGuards( AuthGuard( 'jwt' ) )

	@Get()
	@UseGuards( AuthGuard( 'jwt' ) )
	// Return an array of user's friends
	async getFriends( @Req() request: any ): Promise<IUsersPublic[]> {
		try {
			const friends: IUsersPublic[] | undefined = await this.friendsService.getFriends( request.user.sub );
			if ( !friends )
				throw new BadRequestException( 'User not found' );
			return friends;
		} catch ( err ) {
			throw new ConnectionNotFoundError( err.message );
		}
	}

	@Get( '/logins' )
	@UseGuards( AuthGuard( 'jwt' ) )
	// Return an array of user's friend's logins
	async getFriendsLogins( @Req() request: any ): Promise<string[]> {
		try {
			const friends: string[] | undefined = await this.friendsService.getFriendsLogin( request.user.sub );
			if ( !friends )
				throw new BadRequestException( 'User not found' );
			return friends;
		} catch ( err ) {
			throw new ConnectionNotFoundError( err.message );
		}
	}

	@Get( '/sent' )
	@UseGuards( AuthGuard( 'jwt' ) )
	// Returns pending invites the user sent
	async getSentInvites( @Req() request: any ): Promise<IFriendInvite[]> {
		try {
			const invite: IFriendInvite[] | undefined = await this.friendsService.getSentInvites( request.user.sub );
			if ( !invite )
				throw new BadRequestException( 'User not found' );
			return invite;
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	@Get( '/pending' )
	@UseGuards( AuthGuard( 'jwt' ) )
	// Returns pending invites sent to the user
	async getPendingInvites( @Req() request: any ): Promise<IFriendInvite[]> {
		try {
			const invite: IFriendInvite[] | undefined = await this.friendsService.getPendingInvites( request.user.sub );
			if ( !invite )
				throw new BadRequestException( 'User not found' );
			return invite;
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	@Get( '/admin' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findUsersAdmin( @Req() request: any ): Promise<EFriend[]> {
		try {
			if ( 'admin' === request.user.role )
				return this.friendsService.getAll();
			else throw new UnauthorizedException();
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	//? POST DATA

	@Post( '/invite' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async invite( @Req() request: any, @Query( 'to' ) to: string ): Promise<string> {
		try {
			if ( !to )
				throw new BadRequestException( 'You must provide a user (?to=login)' );
			const receiver: EUser | undefined = await this.usersService.findByLogin( to );
			if ( !receiver )
				throw new BadRequestException( `Unknown user: ${to}` );

			await this.friendsService.invite( request.user.sub, receiver.login );
			return 'User invited';
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	//! Carefull
	// When a user A invites B, the invite request is from A to B
	// When a user B reply to invitation, request is from B to A

	@Post( '/accept' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async accept( @Req() request: any, @Query( 'to' ) to: string ): Promise<string> {
		try {
			if ( !to )
				throw new BadRequestException( 'You must provide a user (?to=login)' );
			const receiver: EUser | undefined = await this.usersService.findByLogin( to );
			if ( !receiver )
				throw new BadRequestException( `Unknown user: ${to}` );

			await this.friendsService.accept( request.user.sub, receiver.login );
			return 'User invite accepted';
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	@Post( '/deny' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async deny( @Req() request: any, @Query( 'to' ) to: string ): Promise<string> {
		try {
			if ( !to )
				throw new BadRequestException( 'You must provide a user (?to=login)' );
			const receiver: EUser | undefined = await this.usersService.findByLogin( to );
			if ( !receiver )
				throw new BadRequestException( `Unknown user: ${to}` );

			await this.friendsService.deny( request.user.sub, receiver.login );
			return 'User invite denied';
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	// Logger.log( `[INFO] Pending invite from ${from} to ${to} created.` );
	// 		return true;
	// 	} catch ( err ) {
	// 		Logger.log ( `[ERROR] Invite from ${from} to ${to} failed.` );
	// 		return false;
	// 	}

	//? REMOVE DATA (dev)

	@Delete()
	// @UseGuards( AuthGuard( 'jwt' ) )
	async removeAll( @Req() request: any ): Promise<string> {
		try {
			// if (
			// 		'admin' === request.user.role
			// 		|| request.user.login === request.body.login
			// 	)
			// 	{
			await this.friendsService.removeAll();
			Logger.log( '[INFO] Users db wiped.' );
			return 'Successfully deleted requests';
			// 		}
			// 		else
			// 			throw new UnauthorizedException();
		} catch ( err ) {
			Logger.log( '[ERROR] Users db wipe failed.' );
			throw new BadRequestException( err.message );
		}
	}
}
