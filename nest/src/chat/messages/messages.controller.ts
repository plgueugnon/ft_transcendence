import { MESSAGE_MAX_LENGTH, TIMESTAMP_MAX_LENGTH, USERNAME_MAX_LENGTH } from 'src/constants';
import { CreateChannelDto } from '../interfaces/createChannel.dto';
import { CreateMessageDto } from '../interfaces/createMessage.dto';
import { Controller, Get, Post, UseGuards, Res, Req, Logger, BadRequestException, UnauthorizedException, Delete, Param, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { IMessages } from '../interfaces/messages.interface';
import { MessagesService } from './messages.service';
import { ChannelsService } from '../channels/channels.service';
import { AuthGuard } from '@nestjs/passport';

@Controller( 'chat' )
export class MessagesController {
	constructor( private messagesService: MessagesService, private ChannelsService: ChannelsService ) { }

	@Get( '/messages' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findAllMessages(): Promise<IMessages[]> {
		try {
			let messages = await this.messagesService.findAllMessages();
			if ( !messages ) {
				messages = [];
			}
			return messages;
		} catch ( error ) {
			throw new BadRequestException( error.message );
		}
	}

	@Get( '/messages/:channelId' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findChannelMessages( @Param( 'channelId' ) channelId: string ): Promise<IMessages[]> {
		try {
			let messages = await this.messagesService.findChannelMessages( channelId );
			if ( !messages ) {
				messages = [];
			}
			return messages;
		} catch ( error ) {
			throw new BadRequestException( error.message );
		}
	}

	@Post( '/messages' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async createMessage( @Body() message: CreateMessageDto ) {
		try {
			let senderLogin = await this.ChannelsService.findUserRoleByChannelId( message.channelId, message.senderLogin );
			if ( !senderLogin || message.senderLogin.length > USERNAME_MAX_LENGTH || message.message.length > MESSAGE_MAX_LENGTH || message.timeStamp.length > TIMESTAMP_MAX_LENGTH )
				throw new BadRequestException( 'Invalid message data' );
			return this.messagesService.createMessage( message );
		} catch ( error ) {
			throw new BadRequestException( error.message );
		}
	}
}
