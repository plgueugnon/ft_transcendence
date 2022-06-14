import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, JoinTable } from 'typeorm';

@Entity( 'channels' )
export class EChannels {
	@PrimaryGeneratedColumn()
	channelId: number;

	@Column()
	channelIdFront: string;

	@Column()
	channelName: string;

	@Column()
	isPrivate: boolean;

	@Column( { nullable: true } )
	password: string;
}
