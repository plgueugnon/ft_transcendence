import { EChannelUsers } from './channelUsers.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity( 'messages' )
export class EMessages {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	channelId: number;

	@Column()
	senderLogin: string;

	@Column()
	message: string;

	@Column()
	timeStamp: string;
}
