export interface IGameScore {
	winnerLogin: string;
	loserLogin: string;
}

export interface IGameHistory {
	gameId?: string;
	timeStamp: string;
	winnerLogin: string;
	looserLogin: string;
	winnerScore: number;
	looserScore: number;
}
