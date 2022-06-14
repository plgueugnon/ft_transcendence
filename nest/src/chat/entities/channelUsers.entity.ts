import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum EChannelRole {
	OWNER = 'Owner',
	ADMIN = 'Admin',
	MEMBER = 'Member',
}

@Entity( 'channelUsers' )
export class EChannelUsers {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	channelId: number;

	@Column()
	role: EChannelRole;

	@Column()
	userLogin: string;

	// * String TimeStamp -> ban until date, if null -> not banned.
	@Column( { default: null } )
	bannedUntil: string;

	// * String TimeStamp -> muted until date, if null -> not muted.
	@Column( { default: null } )
	mutedUntil: string;
}
