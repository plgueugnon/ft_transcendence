import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtConstants } from '../constants';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { EmailsModule } from 'src/emails/emails.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ETwoFA } from './interfaces/twofa.entity';

@Module( {
	imports: [
		PassportModule,
		TypeOrmModule.forFeature( [ ETwoFA ] ),
		JwtModule.register( {
			secret: JwtConstants.secret,
			signOptions: { expiresIn: '1h' },
		} ),
		UsersModule,
		EmailsModule,
	],
	controllers: [ AuthController ],
	providers: [ AuthService, JwtStrategy ],
	exports: [ AuthService ],
} )
export class AuthModule { }
