import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from 'src/users/users.module';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { EBlock } from './interfaces/block.entity';

@Module( {
	imports: [ TypeOrmModule.forFeature( [ EBlock ] ), UsersModule ],
	controllers: [ BlocksController ],
	providers: [ BlocksService ],
} )
export class BlocksModule { }
