import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EUser } from './interfaces/user.entity';
import { EmailsModule } from 'src/emails/emails.module';

@Module( {
	imports: [
		TypeOrmModule.forFeature( [ EUser ] ),
		MulterModule.register( {
			dest: './upload',
		} ),
		EmailsModule,
	],
	controllers: [ UsersController ],
	providers: [ UsersService ],
	exports: [ UsersService ],
} )
export class UsersModule { }
