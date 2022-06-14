import { GameHistoryDto } from './gameHistory.dto';
import { EUser } from 'src/users/interfaces/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EGameHistory } from './gameHistory.entity';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class GameHistoryService {
	constructor(
		@InjectRepository( EGameHistory )
		private gameHistoryRepository: Repository<EGameHistory>
	) { }

	async findAllGameHistory(): Promise<EGameHistory[] | undefined> {
		try {
			return await this.gameHistoryRepository.find();
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	async findGameHistoryByLogin( login: string ): Promise<EGameHistory[] | undefined> {
		try {
			let history: EGameHistory[] | undefined = await this.gameHistoryRepository.createQueryBuilder( 'gameHistory' ).where( { winnerLogin: login } ).orWhere( { looserLogin: login } ).getMany();
			return history;
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	async postGameHistory( game: GameHistoryDto ): Promise<EGameHistory | undefined> {
		try {
			let gameHistory: EGameHistory = new EGameHistory();
			gameHistory.winnerLogin = game.winnerLogin;
			gameHistory.looserLogin = game.looserLogin;
			gameHistory.winnerScore = game.winnerScore;
			gameHistory.looserScore = game.looserScore;
			gameHistory.timeStamp = game.timeStamp;
			return await this.gameHistoryRepository.save( gameHistory );
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}
}
