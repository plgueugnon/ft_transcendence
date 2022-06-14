import { IGameScore } from './interfaces/gameScore.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserProfile } from 'src/auth/interfaces/userProfile.interface';
import { SAMPLE_USERS, USERNAME_MAX_LENGTH } from 'src/constants';
import { EmailsService } from 'src/emails/emails.service';
import { Repository } from 'typeorm';
import { IProfileSettings } from './interfaces/profileSettings.interaface';

import { EUser } from './interfaces/user.entity';
import { IUsersPublic } from './interfaces/usersPublic.interface';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository( EUser )
		private usersRepository: Repository<EUser>,
		private emailsService: EmailsService
	) {
		//* Dev
		this.initDev().then( () => Logger.log( '[INFO] Dummy users created' ) );
	}

	//? GET DATA

	async findAll(): Promise<EUser[]> {
		return this.usersRepository.find();
	}

	async findAllUserPublic(): Promise<IUsersPublic[]> {
		const usersPublic: IUsersPublic[] = ( await this.findAll() ).map( ( element: EUser ) => ( {
			login: element.login,
			name: element.name,
			avatarUrl: element.avatarUrl,
			nbOfWins: element.nbOfWins,
			nbOfLoses: element.nbOfLoses,
		} ) );

		return usersPublic;
	}

	// findById( id: string ): Promise< EUser | undefined > {
	// 	return this.usersRepository.findOne( id );
	// }

	/**
	 * findByLogin()
	 * @param login
	 * @returns User entity if user exists, undifined otherwise
	 */
	async findByLogin( login: string ): Promise<EUser | undefined> {
		const ret = await this.usersRepository.find( { where: { login: login } } );

		if ( ret.length ) {
			// Logger.log( 'User ' + login + ' found.' );
			return ret[ 0 ];
		} else {
			Logger.log( '[WARNING] User ' + login + ' not found.' );
			return undefined;
		}
	}

	/**
	 * findByName()
	 * @param name
	 * @returns User entity if user exists, undifined otherwise
	 */
	async findByName( name: string ): Promise<EUser | undefined> {
		const ret = await this.usersRepository.find( { where: { name: name } } );

		if ( ret.length )
			return ret[ 0 ];
		else
			return undefined;
	}

	/**
	 * findUserProfile()
	 * @param login
	 * @returns User profile if user exists, undifined otherwise
	 */
	async findUserProfile( login: string ): Promise<IUserProfile | undefined> {
		try {
			const rawUser: EUser | undefined = await this.findByLogin( login );
			if ( !rawUser )
				return undefined;

			const userProfile: IUserProfile = {
				login: rawUser.login,
				name: rawUser.name,
				avatarUrl: rawUser.avatarUrl,
				nbOfWins: rawUser.nbOfWins,
				nbOfLoses: rawUser.nbOfLoses,
				isTwoFa: rawUser.isTwoFa,
				isUserCreated: rawUser.avatarUrl !== '' && rawUser.avatarUrl !== 'custom',
			};
			return userProfile;
		} catch ( err ) {
			return undefined;
		}
	}

	/**
	 * findUserPublic()
	 * @param login
	 * @returns User public data if user exists, undifined otherwise
	 */
	async findUserPublic( login: string ): Promise<IUsersPublic | undefined> {
		const rawUser: EUser | undefined = await this.findByLogin( login );
		if ( !rawUser )
			return undefined;

		const userProfile: IUsersPublic = {
			login: rawUser.login,
			name: rawUser.name,
			avatarUrl: rawUser.avatarUrl,
			nbOfWins: rawUser.nbOfWins,
			nbOfLoses: rawUser.nbOfLoses,
		};
		return userProfile;
	}

	//? POST DATA

	async create( user: EUser ): Promise<boolean> {
		try {
			await this.usersRepository.save( user );
			return true;
		} catch ( err ) {
			return false;
		}
	}

	/**
	 * editWithSettings
	 * @param profileSettings new params to save into DB
	 */
	async editWithSettings( profileSettings: IProfileSettings ): Promise<boolean> {
		try {
			let user: EUser = await this.findByLogin( profileSettings.login ); // Get user here

			// If user's not found
			if ( !user )
				return false;
			// If user's avatar was empty (if it is user creation)

			// Check wether the name is used by someone else or not
			const sameUser = await this.findByName( profileSettings.name );
			if ( sameUser && sameUser.login !== user.login )
				return false;

			// If confirm mail must be sent
			//! [deprec] Google changed
			// if ( user.name === '' ) this.emailsService.sendConfirmedEmail( profileSettings.name, user.login + '@student.42.fr' );

			user.name = profileSettings.name.length < USERNAME_MAX_LENGTH ? profileSettings.name.substring( 0, USERNAME_MAX_LENGTH ) : profileSettings.name;
			user.isTwoFa = profileSettings.isTwoFa;
			user.avatarUrl = profileSettings.avatarUrl;
			await this.usersRepository.save( user );

			return true;
		} catch ( err ) {
			Logger.log( '[ERROR] User ' + profileSettings.login + ' edition failed:', profileSettings );
			return false;
		}
	}

	async initDev(): Promise<boolean> {
		try {
			const sampleUsers: EUser[] = SAMPLE_USERS;
			for ( const element of sampleUsers ) {
				await this.usersRepository.save( element );
			}
			return true;
		} catch ( err ) {
			return false;
		}
	}

	async updateUsersGameScore( score: IGameScore ): Promise<boolean> {
		try {
			// * je get les user, redondant avec le controleur mais bon, c'est histoire de bien split les controles et le vrai travail de la fonction
			const winner = await this.usersRepository.createQueryBuilder( 'user' ).where( { login: score.winnerLogin } ).getOne();
			const loser = await this.usersRepository.createQueryBuilder( 'user' ).where( { login: score.loserLogin } ).getOne();
			// * j'update le score du winner et du loser dans ma variable
			winner.nbOfWins++;
			loser.nbOfLoses++;
			// *  j'update le score du winner et du loser en DB
			await this.usersRepository.save( winner );
			await this.usersRepository.save( loser );
			return true;
		} catch ( err ) {
			Logger.log( '[ERROR] User ' + score + ' edition failed:', score );
			return false;
		}
	}

	//? DELETE DATA

	async removeUserByLogin( login: string ) {
		try {
			const user: EUser = await this.findByLogin( login );
			if ( user )
				this.usersRepository.remove( user );
			else throw new Error( `User ${login} not found` );
		} catch ( err ) {
			throw new Error( err );
		}
	}

	async removeAll(): Promise<boolean> {
		try {
			const allIds = ( await this.findAll() ).map( ( element ) => element.id );

			if ( allIds.length ) {
				this.usersRepository.delete( allIds );
				Logger.log( '[INFO] Users db wiped.' );
			}
		} catch ( err ) {
			Logger.log( '[ERROR] Users db wipe failed.' );
			return false;
		}
	}

	// async removeByLogin( login: string ): Promise< string > {
	// try {
	// 	await this.usersRepository.delete( id );
	// } catch ( err ) {
	// 	return "[ERROR] Unable to erase user#" + id + ".";
	// } finally {
	// 	return "user#" + id + " erased.";
	// }
	// }
}
