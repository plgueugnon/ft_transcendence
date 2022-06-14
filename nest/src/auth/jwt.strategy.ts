import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { JwtConstants } from '../constants';
import { IJwtPayload } from './interfaces/jwtPayload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {
	constructor() {
		super( {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: JwtConstants.secret,
		} );
	}

	async validate( payload: any ): Promise<IJwtPayload> {
		return { sub: payload.sub, role: payload.role };
	}
}
