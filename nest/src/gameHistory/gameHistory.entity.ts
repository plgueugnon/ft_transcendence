import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity( 'gameHistory' )
export class EGameHistory {
	@PrimaryGeneratedColumn()
	gameId: string;

	@Column()
	timeStamp: string;

	@Column()
	winnerLogin: string;

	@Column()
	looserLogin: string;

	@Column()
	winnerScore: number;

	@Column()
	looserScore: number;
}
