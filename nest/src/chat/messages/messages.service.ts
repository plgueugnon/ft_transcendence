import { CreateMessageDto } from '../interfaces/createMessage.dto';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { EMessages } from '../entities/messages.entity';

@Injectable()
export class MessagesService {
	channelsRepository: any;
	constructor(
		@InjectRepository( EMessages )
		private messagesRepository: Repository<EMessages>
	) { }

	//? GET DATA

	async findAllMessages(): Promise<EMessages[]> {
		try {
			return await this.messagesRepository.find();
		} catch ( error ) {
			throw new BadRequestException( error.message );
		}
	}

	// filter messages by channelId
	async findChannelMessages( channelId: string ): Promise<EMessages[]> {
		try {
			const messages = await getRepository( EMessages ).createQueryBuilder( 'messages' ).where( 'messages.channelId = :channelId', { channelId } ).getMany();
			return messages;
		} catch ( error ) {
			return [];
		}
	}

	//? POST DATA

	// function which create a new message in the database
	async createMessage( createMessageDto: CreateMessageDto ): Promise<EMessages> {
		const newMessage = new EMessages();
		newMessage.message = createMessageDto.message;
		newMessage.channelId = createMessageDto.channelId;
		newMessage.senderLogin = createMessageDto.senderLogin;
		newMessage.timeStamp = createMessageDto.timeStamp;
		return await this.messagesRepository.save( newMessage );
	}

	// async createMessage( message: CreateMessageDto )
	// {
	// 		const newMessage= this.messagesRepository.create( message );
	// 		await this.messagesRepository.save( message );
	// 		return newMessage;
	// }

	//? DELETE DATA

	// async removeAll(): Promise< boolean > {
	// 	try {
	// 		const	allIds = ( await this.findAll() ).map( element => element.id );

	// 		this.usersRepository.delete( allIds );
	// 	} catch ( err ) {
	// 		Logger.log( "error: Users db wipe failed" );
	// 		return false;
	// 	}
	// }
}
