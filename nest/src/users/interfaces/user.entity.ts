import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TRole } from './roles.type';

@Entity( 'users' )
export class EUser {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column()
	login: string;

	@Column()
	role: TRole;

	@Column()
	name: string;

	@Column()
	avatarUrl: string;

	@Column()
	nbOfWins: number;

	@Column()
	nbOfLoses: number;

	@Column()
	isTwoFa?: boolean;
}
