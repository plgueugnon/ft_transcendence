import { EGameStatus } from './EGameStatus.inferface';

export interface IGame {
	idGame: number;
	idPlayer1: number;
	idPlayer2: number;
	posPaddle1: number;
	posPaddle2: number;
	posBall_x: number;
	posBall_y: number;
	scorePlayer1: number;
	scorePlayer2: number;
	status: number;
}

export interface IOnlineGame {
	gameId: string;
	gameStatus: EGameStatus;
	gameOwner: string;
	gamePlayer: string;
	gameWatcher: string[];
	scoreOwner: number;
	scorePlayer: number;
}

export interface IInviteUserInGame {
	gameId: string;
	senderLogin: string;
	receiverLogin: string;
}
