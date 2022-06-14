import { useEffect, useState } from 'react';
import Containers from '../../components/containers';
import Pong from './pong_elements/Pong';
import { GameContext } from '../../contexts/gameContext';
import { GameMainMenu } from './components/GameMainMenu';
import { User } from './interfaces/constantes';
import { IOnlineGame } from './interfaces/onlineGameInterface';

export function GamePage(): JSX.Element {
	const [ inGameState, setinGameState ] = useState<Boolean>( true );
	const [ openGameList, setOpenGameList ] = useState<IOnlineGame[]>( [] );
	const [ gameRole, setGameRole ] = useState<User | undefined>( undefined );
	const [ newGameID, setNewGameID ] = useState<string>( '' );
	const [ trainingGameState, setTrainingGameState ] = useState<Boolean>( false );
	const [ isBonusEnabled, setIsBonusEnabled ] = useState<boolean>( false );

	useEffect( () => { }, [ inGameState ] );

	return (
		<GameContext.Provider
			value={{
				inGame: inGameState,
				setInGame: setinGameState,
				gameList: openGameList,
				setGameList: setOpenGameList,
				gameRole: gameRole,
				setGameRole: setGameRole,
				gameID: newGameID,
				setGameID: setNewGameID,
				trainingGame: trainingGameState,
				setTrainingGame: setTrainingGameState,
				isBonusEnabled: isBonusEnabled,
				setIsBonusEnabled: setIsBonusEnabled,
			}}
		>
			<Containers.NoScroll>
				<Containers.Page>
					<div>{inGameState ? <GameMainMenu /> : <Pong />}</div>
				</Containers.Page>
			</Containers.NoScroll>
		</GameContext.Provider>
	);
}
