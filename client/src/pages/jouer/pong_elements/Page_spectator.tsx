import React, { useContext, useRef, useState } from 'react';
import { SocketContext } from '../../../contexts/socketContext';
import { GameContext } from '../../../contexts/gameContext';
import { User } from '../interfaces/constantes';
import { IGame } from '../interfaces/gameInterface';
import Jeux from './Jeux';

const Canvas_visio: React.FC<{}> = () => {
	let canvasRef = useRef<HTMLCanvasElement | null>( null );
	let context = React.useRef<CanvasRenderingContext2D | null>( null );

	const [ width ] = useState( 1127 );
	const [ height ] = useState( 600 );
	const socket = useContext( SocketContext );

	const gameContext = useContext( GameContext );
	const [ instanceGame ] = useState( new Jeux( width, height, User.WATCHER, false, gameContext.isBonusEnabled ) );

	socket?.off( 'pongGameplayData' );
	socket?.on( 'pongGameplayData', function ( gameData: IGame ) {
		if ( canvasRef.current ) {
			context.current = canvasRef.current.getContext( '2d' );

			const ctx = context.current;
			instanceGame.receiveSocket( gameData ); // ! ici reception des donnees de jeux
			instanceGame.display( ctx );
		}
	} );

	socket?.off( 'gameHasEnded' );
	socket?.on( 'gameHasEnded', function ( EndGameStatus: number ) {
		if ( EndGameStatus === 1 )
			instanceGame.setInfo( 'Player 1 win !' );
		else
			instanceGame.setInfo( 'Player 2 win !' );
	} );

	socket?.off( 'gameStarted' );
	socket?.on( 'gameStarted', function () {
		instanceGame.starting();
	} );

	return (
		<div>
			<canvas id="canvas" width={width} height={height} style={{ width: '100%', height: '100%' }} ref={canvasRef}></canvas>
		</div>
	);
};
export default Canvas_visio;
