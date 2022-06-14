import { Controller, Get, Query, BadRequestException, Logger, UseGuards, Req, Body, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';

import { AuthService } from './auth.service';
import { ILoginSuccess } from './interfaces/loginSuccess.interface';
import { IRefreshedToken } from './interfaces/refreshedToken.interface';

@Controller( 'auth' )
export class AuthController {
	constructor( private authService: AuthService, private usersService: UsersService ) { }

	// Authorization code validation function
	@Get( 'get_token' )
	async getToken( @Query( 'code' ) code: string ): Promise<ILoginSuccess> {
		try {
			const loginSuccess: ILoginSuccess = await this.authService.loginResponseByCode( code, 'auto' );
			// Logger.log( '[INFO] New login', loginSuccess );
			return loginSuccess;
		} catch ( err ) {
			throw new BadRequestException( err );
		}
	}

	@Get( 'guest/get_token' )
	async getGuestToken(): Promise<ILoginSuccess> {
		try {
			const loginSuccess: ILoginSuccess = await this.authService.guestLoginResponse();
			Logger.log( '[INFO] New guest login', loginSuccess );
			return loginSuccess;
		} catch ( err ) {
			throw new BadRequestException( err );
		}
	}

	// Sign a new token duplicating the actual payload
	@Get( 'refresh_token' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async refreshToken( @Req() request: any ): Promise<IRefreshedToken> {
		try {
			const apiToken = this.authService.deliverToken( request.user.sub, request.user.role );
			const res: IRefreshedToken = {
				freshToken: apiToken,
				expirationDate: new Date( new Date().getTime() + 1000 * 60 * 60 ),
			};
			return res;
		} catch ( err ) {
			throw new BadRequestException( err );
		}
	}

	@Get( 'twofa/get_token' )
	async twoFaGetToken( @Query( 'login' ) login: string, @Query( 'code' ) twoFaCode: string ): Promise<ILoginSuccess> {
		try {
			const isTwoFaCorrect = await this.authService.checkTwoFaCode( login, twoFaCode );
			if ( isTwoFaCorrect ) {
				const loginSuccess: ILoginSuccess = await this.authService.loginResponseByLogin( login, 'no' );
				return loginSuccess;
			} else throw new UnauthorizedException( 'Bad 2FA code' );
		} catch ( err ) {
			throw new UnauthorizedException( 'Bad 2FA code' );
		}
	}
}
