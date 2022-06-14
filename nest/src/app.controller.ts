import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController { 
	@Get( 'up' )
	getUp(): string {
		return 'up';
	}
}
