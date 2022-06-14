import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

type TFriendStatus = 'none' | 'pending' | 'accepted';

@Entity( 'friends' )
export class EFriend {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column()
	sender: string;

	@Column()
	receiver: string;

	// @Column()
	// date: string;

	@Column()
	status: TFriendStatus;
}
