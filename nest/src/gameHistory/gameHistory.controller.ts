import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IUserProfile } from 'src/auth/interfaces/userProfile.interface';
import { USERNAME_MAX_LENGTH } from 'src/constants';
import { UsersService } from 'src/users/users.service';
import { GameHistoryDto } from './gameHistory.dto';
import { EGameHistory } from './gameHistory.entity';
import { GameHistoryService } from './gameHistory.service';

@Controller( 'game' )
export class GameHistoryController {
	constructor( private gameHistoryService: GameHistoryService, private usersService: UsersService ) { }

	@Get( '/history' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findAllGameHistory(): Promise<EGameHistory[] | undefined> {
		try {
			let history: EGameHistory[] | undefined = await this.gameHistoryService.findAllGameHistory();
			if ( !history )
				history = [];
			return history;
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	@Get( '/history/:login' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findGameHistoryByLogin( @Param( 'login' ) login: string ): Promise<EGameHistory[]> {
		try {
			if ( !login || login.length > USERNAME_MAX_LENGTH )
				throw new BadRequestException( 'Missing login or to long login' );
			const userProfile: IUserProfile | undefined = await this.usersService.findUserProfile( login );
			if ( !userProfile )
				throw new BadRequestException( 'User not found' );
			return this.gameHistoryService.findGameHistoryByLogin( login );
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	@Post( '/history' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async postGameHistory( @Body() game: GameHistoryDto ) {
		try {
			let login = game.looserLogin;
			if ( !login || login.length > USERNAME_MAX_LENGTH )
				throw new BadRequestException( 'Missing login or to long login' );
			let userProfile: IUserProfile | undefined = await this.usersService.findUserProfile( login );
			if ( !userProfile )
				throw new BadRequestException( 'User not found' );
			login = game.winnerLogin;
			if ( !login || login.length > USERNAME_MAX_LENGTH )
				throw new BadRequestException( 'Missing login or to long login' );
			userProfile = await this.usersService.findUserProfile( login );
			if ( !userProfile )
				throw new BadRequestException( 'User not found' );
			return this.gameHistoryService.postGameHistory( game );
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}
}
