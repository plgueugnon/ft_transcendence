import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class	EmailsService {

	constructor ( private mailerService: MailerService ) {}

	/**
	 * sendConfirmedEmail()
	 * @param username user's username
	 * @param email user's email address
	 * Send a confirmation email to user on account creation
	 * !DEPREC - Google mailer locked its service for 'unsecure' apps.
	 */
	async	sendConfirmedEmail( username: string, email: string )
	{
		try {
			Logger.log( `[INFO] Sending confirm mail to ${email}` );
			this.mailerService.sendMail( {
				to: email,
				subject: "Fantstic Salmon's welcome mail !",
				template: 'confirmed',
				context: {
					username,
					email
				}
			} ).then( ( response ) => Logger.log( response ) );
		} catch ( err ) {
			throw err;
		}
	}

	/**
	 * sendConfirmationEmail()
	 * @param login user's login
	 * @param email user's email address
	 * @param code c'est le code
	 * !DEPREC - Google mailer locked its service for 'unsecure' apps.
	 */
	async	sendConfirmationEmail( login: string, email: string, code: string )
	{
		try {
			/*
			await	this.mailerService.sendMail( {
				to: email,
				subject: "Fantastic Salmon's 2FA",
				template: 'confirm',
				context: {
					login,
					code,
				}
			} ).then( ( response ) => Logger.log( response ) );
			*/
			Logger.log( 'EMAIL SENT - ',
			{
				to: email,
				subject: "Fantastic Salmon's 2FA",
				template: 'confirm',
				context: {
					login,
					code,
				}
			} )
		} catch ( err ) {
			throw err;
		}
	}

}