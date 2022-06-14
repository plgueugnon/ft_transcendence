import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Module } from "@nestjs/common";
import { join } from "path";
import { EmailsService } from "./emails.service";

@Module( {
	imports: [
		MailerModule.forRoot( { 
			transport: {
				service: 'gmail',
				secure: false,
				auth: {
					user: process.env.MAILER_ID,
					pass: process.env.MAILER_PASS,
				}
			},
			preview: true,
			defaults: {
				from: '"Fantastic Salmon" <' + process.env.MAILER_ID + '>',
			},
			template: {
				dir: join( __dirname, '../../templates/' ),
				adapter: new HandlebarsAdapter(),
				options: {
					strict: true,
				}
			}
		} ),
	],
	providers: [ EmailsService ],
	exports: [ EmailsService ],
} )
export class	EmailsModule {}