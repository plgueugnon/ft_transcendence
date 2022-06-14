import React from 'react';
import { User } from '../pages/jouer/interfaces/constantes';
import { IGame } from '../pages/jouer/interfaces/gameInterface';
import { IOnlineGame } from '../pages/jouer/interfaces/onlineGameInterface';

export interface IGameContext {
	inGame: Boolean;
	setInGame: Function;
	gameList: IOnlineGame[];
	setGameList: Function;
	// User = enum g	ame role (host, player, watcher)
	gameRole: User | undefined;
	setGameRole: Function;
	gameID: string;
	setGameID: Function;
	trainingGame: Boolean;
	setTrainingGame: Function;
	isBonusEnabled: boolean;
	setIsBonusEnabled: Function;
}

export const GameContext = React.createContext<IGameContext>( {
	inGame: true,
	setInGame: () => { },
	gameList: [],
	setGameList: () => { },
	gameRole: undefined,
	setGameRole: () => { },
	gameID: '',
	setGameID: () => { },
	trainingGame: false,
	setTrainingGame: () => { },
	isBonusEnabled: false,
	setIsBonusEnabled: ( value: boolean ) => { },
} );
