import React, { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../../../contexts/socketContext';
import { GameContext } from '../../../contexts/gameContext';
import { useKeyPress } from '../../../hooks/useKeyPress';
import { Status, User } from '../interfaces/constantes';
import { IGame } from '../interfaces/gameInterface';
import Jeux from './Jeux';

const Canvas_player: React.FC<{}> = () => {
	let canvasRef = useRef<HTMLCanvasElement | null>( null );
	let context = React.useRef<CanvasRenderingContext2D | null>( null );

	const [ width ] = useState( 1127 );
	const [ height ] = useState( 600 );
	const [ heightCanvas, setHeightCanvas ] = useState( height );
	const socket = useContext( SocketContext );
	const enterPress = useKeyPress( 'Enter' );
	const gameContext = useContext( GameContext );

	const [ instanceGame ] = useState( new Jeux( width, height, User.PLAYER, false, gameContext.isBonusEnabled ) );

	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );

	window.onresize = function () {
		let canvas = document.getElementById( 'canvas' );
		if ( canvas ) {
			if ( !mounted.current )
				return;
			setHeightCanvas( canvas?.clientHeight );
		}
	};

	socket?.off( 'pongGameplayData' );
	socket?.on( 'pongGameplayData', function ( gameData: IGame ) {
		if ( canvasRef.current ) {
			context.current = canvasRef.current.getContext( '2d' );

			const ctx = context.current;
			instanceGame.receiveSocket( gameData ); // ! ici reception des donnees de jeux
			instanceGame.display( ctx );
			let canvaContainer = document.getElementById( 'canvas' );
			if ( canvaContainer )
				setHeightCanvas( canvaContainer!.clientHeight ); //to responsive Paddle move
		}
	} );

	socket?.off( 'gameHasEnded' )
	socket?.on( 'gameHasEnded', function ( EndGameStatus: number ) {
		if ( EndGameStatus === 2 )
			instanceGame.setInfo( "You win !" );
		else
			instanceGame.setInfo( "You lose... LOSER !" );
	} )

	socket?.off( 'gameStarted' );
	socket?.on( 'gameStarted', function () {
		instanceGame.starting();
	} );

	socket?.off( 'newPoint' );
	socket?.on( 'newPoint', function () {
		instanceGame.stop();
	} );

	useEffect( () => {
		if ( enterPress ) {
			if ( instanceGame.status !== Status.FINISH ) {
				socket?.emit( 'startGameplay', gameContext.gameID );
				// instanceGame.starting()
			}
		}
	}, [ enterPress ] );

	return (
		<div>
			<canvas
				id="canvas"
				width={width}
				height={height}
				style={{ width: '100%', height: '100%' }}
				ref={canvasRef}
				onMouseOver={( event ) => {
					document.body.style.cursor = 'none';
				}}
				onMouseOut={( event ) => {
					document.body.style.cursor = 'default';
				}}
				onMouseMove={( event ) => {
					instanceGame.movePlayer2( event.nativeEvent.offsetY.valueOf(), heightCanvas );
					let y = ( event.nativeEvent.offsetY.valueOf() * 600 ) / heightCanvas;
					socket?.emit( 'updatePaddlePlayer2', [ y, gameContext.gameID ] );
				}}
			></canvas>
		</div>
	);
};
export default Canvas_player;
