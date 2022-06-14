import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';

import { APP_LOGIN_REDIRECT_URL, DEFAULT_AVATARS_TAB, DEFAULT_USERNAMES_TAB, FT_API_SECRET, FT_API_UID, FT_API_URL, FT_MAIL_ADDRESS, TWOFA_CODE_LENGTH } from 'src/constants';
import { ILoginSuccess } from './interfaces/loginSuccess.interface';
import { EmailsService } from 'src/emails/emails.service';
import { EUser } from 'src/users/interfaces/user.entity';
import { TRole } from 'src/users/interfaces/roles.type';
import { UsersService } from 'src/users/users.service';
import { ETwoFA } from './interfaces/twofa.entity';
import { rand, randNum, randString } from 'src/utils/hash';

@Injectable()
export class AuthService {
	private TwoFaCode: number;

	constructor(
		private jwtService: JwtService,
		private usersService: UsersService,
		private emailsService: EmailsService,
		@InjectRepository( ETwoFA )
		private twoFaRepository: Repository<ETwoFA>
	) {
		this.TwoFaCode = Math.floor( 10000 + Math.random() * 90000 );
	}

	/**
	 * get42Token()
	 * @param authorization_code OAuth code received during login redirection
	 * @returns ex: {
	 *		"access_token": "xxxx",
	 *		"token_type": "bearer",
	 *		"expires_in": 7145,
	 *		"refresh_token": "xxxx",
	 *		"scope": "public",
	 *		"created_at": 1647612284
	 *	}
	 */
	async get42Token( authorization_code: string ) {
		const requestUri: string = FT_API_URL + '/oauth/token';

		Logger.log( 'POST ' + requestUri );
		const response = await axios.post(
			requestUri,
			{
				grant_type: 'authorization_code',
				client_id: FT_API_UID,
				client_secret: FT_API_SECRET,
				code: authorization_code,
				scope: 'public',
				redirect_uri: APP_LOGIN_REDIRECT_URL,
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
		Logger.log( response.data );
		return response.data;
	}

	/**
	 * get42LoginWith42Token()
	 * @param ftToken access_token issued when calling to get42Token()
	 * @returns login of the user
	 */
	async get42LoginWith42Token( ftToken: string ): Promise<string> {
		const requestUri: string = FT_API_URL + '/v2/me';

		const response = await axios.get( requestUri, {
			headers: {
				Authorization: 'Bearer ' + ftToken,
			},
		} );
		Logger.log( '[INFO] Retrieved user ' + response.data.login + ' from 42 API.' );
		return response.data.login;
	}

	/**
	 * deliverToken()
	 * @param login login of the user requesting a token
	 * @param role
	 * Sign a JWT Token encapsulating login and a role inside it.
	 */
	deliverToken( login: string, role: TRole ): string {
		const payload = { sub: login, role: role };
		return this.jwtService.sign( payload );
	}

	/**
	 * loginResponseByLogin()
	 * @param login user's login
	 * Build a loginSuccess response and returns it according to login
	 */
	async loginResponseByLogin( login: string, twoFa: 'yes' | 'no' | 'auto' = 'auto' ): Promise<ILoginSuccess> {
		// Lookup for this user in the DB
		let userCreation: boolean;
		let userRole: TRole;
		let userData: EUser;
		// user exist
		if ( ( userData = await this.usersService.findByLogin( login ) ) ) {
			//TODO Remove checking through tabs ?
			userRole = userData.role;
			userCreation = false;
		}
		// user does not exist
		else {
			userRole = 'user';
			userData = {
				login: login,
				role: userRole,
				name: '',
				avatarUrl: '',
				nbOfWins: 0,
				nbOfLoses: 0,
				isTwoFa: false,
			};
			await this.usersService.create( userData );
			userCreation = true;
		}

		// Setup twoFa policy of this response
		let twoFaChoice: boolean;
		switch ( twoFa ) {
			case 'yes':
				twoFaChoice = true;
				break;
			case 'no':
				twoFaChoice = false;
				break;
			case 'auto':
				twoFaChoice = userData.isTwoFa;
				break;
			default:
				break;
		}

		// Handle twoFa mailing and db creation
		if ( twoFaChoice ) {
			const clearCode: string = randNum( TWOFA_CODE_LENGTH );
			const hash: string = await bcrypt.hash( clearCode, 1 );
			const expDate: Date = new Date( new Date().getTime() + 1000 * 60 * 10 ); // 10min

			const twoFA: ETwoFA = {
				login: login,
				code: hash,
				expirationDate: expDate.toISOString(),
			};

			try {
				await this.twoFaRepository.save( twoFA );

				await this.emailsService.sendConfirmationEmail( login, login + FT_MAIL_ADDRESS, clearCode );
			} catch ( err ) {
				throw err;
			}
		}

		// Create loginSuccess response
		const loginSuccess: ILoginSuccess = {
			login: login,
			userCreation: userCreation,
			twoFa: twoFaChoice,
			apiToken: twoFaChoice ? '' : this.deliverToken( login, userRole ),
			// 60min
			expirationDate: twoFaChoice
				? new Date( new Date().getTime() + 1000 * 60 * 10 ) // 10min
				: new Date( new Date().getTime() + 1000 * 60 * 60 ),
		};
		return loginSuccess;
	}

	/**
	 * loginResponseByCode()
	 * @param code le code issued by 42 API
	 * @param twoFa if it's yes, returns a 2FA request loginSuccess (without token), if it's no returns the full response.
	 * If it's auto behave according to user entry isTwoFa
	 * Build a loginSuccess response and returns it
	 */
	async loginResponseByCode( code: string, twoFa: 'yes' | 'no' | 'auto' = 'auto' ): Promise<ILoginSuccess> {
		// Get 42 token
		const ftTokens = await this.get42Token( code );

		// Get user 42 login
		const userLogin = await this.get42LoginWith42Token( ftTokens.access_token );

		return await this.loginResponseByLogin( userLogin, twoFa );
	}

	/**
	 * guestLoginResponse()
	 * Build a loginSuccess response and returns it
	 */
	async guestLoginResponse(): Promise<ILoginSuccess> {
		try {
			//  Create guest user
			const newUser: EUser = {
				login: randString( 8 ),
				role: 'guest',
				name: DEFAULT_USERNAMES_TAB[ rand( 0, DEFAULT_USERNAMES_TAB.length - 1 ) ],
				avatarUrl: DEFAULT_AVATARS_TAB[ rand( 0, DEFAULT_AVATARS_TAB.length - 1 ) ],
				nbOfWins: 0,
				nbOfLoses: 0,
				isTwoFa: false,
			};

			const response = await this.usersService.create( newUser );
			if ( !response )
				throw new Error( 'User creation failed' );

			return await this.loginResponseByLogin( newUser.login, 'no' );
		} catch ( err ) {
			throw err;
		}
	}

	/**
	 * checkTwoFaCode()
	 * @param login user's login
	 * @param twoFaCode user's input for 2FA (cleartext)
	 * Lookup for 2FA stored in DB and chack for it's validity.
	 */
	async checkTwoFaCode( login: string, twoFaCode: string ): Promise<boolean> {
		try {
			const twoFaLine: ETwoFA[] | undefined = await this.twoFaRepository.find( { where: { login: login } } );
			if ( twoFaLine ) {
				const isMatch = await bcrypt.compare( twoFaCode, twoFaLine[ 0 ].code );
				// If expirationDate is passed, send false
				if ( new Date( twoFaLine[ 0 ].expirationDate ).getTime() < new Date().getTime() )
					return false;

				return isMatch;
			} else throw new Error( 'Bad login' );
		} catch ( err ) {
			throw err;
		}
	}
}
