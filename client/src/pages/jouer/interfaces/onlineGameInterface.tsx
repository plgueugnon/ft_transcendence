import { EGameStatus } from './EGameStatusInterface';

export interface IOnlineGame {
	gameId: string
	gameStatus: EGameStatus
	gameOwner: string
	gamePlayer: string
	gameWatcher: string[]
	scoreOwner: number
	scorePlayer: number
	isBonusEnabled: boolean,
}
