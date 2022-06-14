import { Controller, Get, Post, UseGuards, Req, BadRequestException, Delete, Query, Logger } from '@nestjs/common';
import { ConnectionNotFoundError } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';

import { EUser } from 'src/users/interfaces/user.entity';
import { IUsersPublic } from 'src/users/interfaces/usersPublic.interface';
import { BlocksService } from './blocks.service';
import { UsersService } from 'src/users/users.service';

@Controller( 'blocks' )
export class BlocksController {
	constructor( private blocksService: BlocksService, private usersService: UsersService ) { }

	//? GET DATA

	@Get( '/logins' )
	@UseGuards( AuthGuard( 'jwt' ) )
	// Return an array of user's blocked logins
	async getBlockedLogins( @Req() request: any ): Promise<string[]> {
		try {
			const users: string[] | undefined = await this.blocksService.getBlocked( request.user.sub );
			if ( !users )
				throw new BadRequestException( 'No users' );
			return users;
		} catch ( err ) {
			throw new ConnectionNotFoundError( err.message );
		}
	}

	//? POST DATA

	@Post( '/block' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async blockUser( @Req() request: any, @Query( 'to' ) to: string ) {
		try {
			if ( !to ) throw new BadRequestException( 'You must provide a user (?to=login)' );
			const receiver: EUser | undefined = await this.usersService.findByLogin( to );
			if ( !receiver )
				throw new BadRequestException( `Unknown user: ${to}` );

			await this.blocksService.block( request.user.sub, receiver.login );
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	@Post( '/unblock' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async unblockUser( @Req() request: any, @Query( 'to' ) to: string ) {
		try {
			if ( !to ) throw new BadRequestException( 'You must provide a user (?to=login)' );
			const receiver: EUser | undefined = await this.usersService.findByLogin( to );
			if ( !receiver )
				throw new BadRequestException( `Unknown user: ${to}` );

			await this.blocksService.unblock( request.user.sub, receiver.login );
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}
}
