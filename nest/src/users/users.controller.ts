import { Controller, Get, Post, UseGuards, Res, Req, Logger, BadRequestException, UnauthorizedException, Delete, Param, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import fs from 'fs';

import { UsersService } from './users.service';
import { EUser } from './interfaces/user.entity';
import { IUserProfile } from 'src/auth/interfaces/userProfile.interface';
import { IUsersPublic } from './interfaces/usersPublic.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randString } from 'src/utils/hash';
import { API_AVATAR_GET_URL } from 'src/constants';
import path from 'path/posix';
import { IGameScore } from './interfaces/gameScore.interface';

@Controller( 'users' )
export class UsersController {
	constructor( private usersService: UsersService ) { }

	//? GET DATA

	@Get()
	async findUsersPublic(): Promise<IUsersPublic[]> {
		return this.usersService.findAllUserPublic();
	}

	@Get( '/admin' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findUsersAdmin( @Req() request: any ): Promise<EUser[]> {
		try {
			if ( request.user.role === 'admin' )
				return this.usersService.findAll();
			else throw new UnauthorizedException();
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	@Get( '/profile/:login' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findUserProfile( @Param( 'login' ) login: string, @Req() request: any ): Promise<IUserProfile> {
		try {
			if ( !login )
				throw new BadRequestException( 'Missing login' );

			if ( request.user.role === 'admin' || request.user.sub === login ) {
				const userProfile: IUserProfile | undefined = await this.usersService.findUserProfile( login );
				if ( !userProfile )
					throw new BadRequestException( 'User not found' );
				return userProfile;
			} else throw new UnauthorizedException();
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	@Get( '/public/:login' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findUserPublic( @Param( 'login' ) login: string, @Req() request: any ): Promise<IUsersPublic> {
		try {
			if ( !login )
				throw new BadRequestException( 'Missing login' );

			const userProfile: IUsersPublic | undefined = await this.usersService.findUserPublic( login );
			if ( !userProfile )
				throw new BadRequestException( 'User not found' );
			return userProfile;
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	@Get( '/avatars/:filename' )
	seeUploadedFile( @Param( 'filename' ) filename, @Res() res: any ) {
		return res.sendFile( filename, { root: './upload' } );
	}

	//? POST DATA

	@Post( '/edit' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async create( @Req() request: any ): Promise<string> {
		try {
			if ( request.user.role === 'admin' || request.user.sub === request.body.login ) {
				this.usersService.editWithSettings( request.body );
				Logger.log( '[INFO] User ' + request.user.sub + ' edited.' );
				return 'User created';
			} else throw new UnauthorizedException();
		} catch ( err ) {
			Logger.log( '[ERROR] User ' + request.user.sub + ' edition failed.' );
			throw new BadRequestException( err.message );
		}
	}

	@Post( '/upload-avatar' )
	@UseGuards( AuthGuard( 'jwt' ) )
	@UseInterceptors(
		FileInterceptor( 'file', {
			storage: diskStorage( {
				destination: './upload',
				filename: ( req: any, file, callback: Function ) => {
					let newFilename: string;
					const extension: string = extname( file.originalname );
					newFilename = req.user.sub + randString( 3 ) + extension;
					callback( null, newFilename );
				},
			} ),
			fileFilter: ( req: any, file, callback: Function ) => {
				// If file is an image
				if ( file.mimetype.substring( 0, 5 ) !== 'image' && !file.originalname.match( /\.(jpg|jpeg|png|gif)$/ ) )
					callback( new BadRequestException( 'Invalid file type' ), false );
				callback( null, true );
			},
		} )
	)
	async uploadImage( @Req() request: any, @UploadedFile() file: Express.Multer.File ): Promise<string> {
		try {
			const user = await this.usersService.findUserProfile( request.user.sub );
			if ( !user )
				throw new BadRequestException( 'User not found' );

			// Delete old avatar file
			Logger.log( 'Old avatar path : ' + user.avatarUrl );
			if ( user.avatarUrl !== '' ) {
				// does not work
				const filename: string = user.avatarUrl.substring( API_AVATAR_GET_URL.length + 1 ); // +1 for last '/'
				Logger.log( `[INFO] Deleting ${filename}` );
				try {
					fs.unlinkSync( './upload/' + filename );
				} catch ( err ) {
					Logger.log( '[ERROR] ' + err.message );
				}
			}

			// Replace avatar path with new one
			user.avatarUrl = API_AVATAR_GET_URL + '/' + file.filename;
			this.usersService.editWithSettings( user );

			Logger.log( '[INFO] User ', request.user.sub, ' uploaded a file.' );
			return 'User avatar has been upload, path: ' + file.path;
		} catch ( err ) {
			throw new BadRequestException( err.message );
		}
	}

	@Post( '/init' )
	// @UseGuards( AuthGuard( 'jwt' ) )
	async initDev( @Req() request: any ): Promise<string> {
		// try {
		// 	if (
		// 		request.user.role === 'admin'
		// 		|| request.user.login === request.body.login
		// 	)
		// 	{
		await this.usersService.initDev();
		Logger.log( '[INFO] Init users db.' );
		return 'Successfully created users';
		// 		}
		// 		else
		// 			throw new UnauthorizedException();
		// 	} catch( err ) {
		// 		throw new BadRequestException( err.message );
		// 	}
	}

	@Post( '/game' ) // * Ici on prend toutes le requetes de la route /users/game parceque je suis deja dans le fichier qui intercepte /users
	@UseGuards( AuthGuard( 'jwt' ) ) // * ici si il n'y a pas le bon token, il va renvoyer une erreur et meme pas rentrer dans la fonction
	async updateUsersGameScore( @Body() score: IGameScore ) {
		try {
			// * la je get le profil du winner et du loser
			const winner = await this.usersService.findUserProfile( score.winnerLogin );
			const loser = await this.usersService.findUserProfile( score.loserLogin );
			// * je verifie que les deux utilisateurs existent, s'ils existent pas je recois un undefined
			if ( !winner || !loser )
				throw new BadRequestException( 'User not found' );

			// j'appelle la fonction updateGameScore qui est dans le service
			await this.usersService.updateUsersGameScore( score );

			// * je retourne un message
			return 'Score updated';
		} catch ( err ) {
			throw new BadRequestException( err );
		}
	}

	//? REMOVE DATA
	@Delete( "/login/:login" )
	@UseGuards( AuthGuard( "jwt" ) )
	async deleteUser( @Param( "login" ) login: string, @Req() request: any, ): Promise<string>
	{
		try {
			// auth
			if ( request.user.sub === login || request.user.role !== 'admin' ) {
				await this.usersService.removeUserByLogin( login );
				Logger.log( `Deleting user ${login}` );
				return 'User deleted';
			} else throw new UnauthorizedException();
		} catch ( err ) {
			throw new BadRequestException( err );
		}
	}

	@Delete( '/reset' )
	// @UseGuards( AuthGuard( 'jwt' ) )
	async resetAll( @Req() request: any ): Promise<string> {
		// try {
		// 	if (
		// 		'admin' === request.user.role
		// 		|| request.user.login === request.body.login
		// 	)
		// 	{
		await this.usersService.removeAll();
		await this.usersService.initDev();
		return "Successfully deleted users";
		// 		}
		// 		else
		// 			throw new UnauthorizedException();
		// 	} catch( err ) {
		// 		throw new BadRequestException( err.message );
		// 	}
	}
}
