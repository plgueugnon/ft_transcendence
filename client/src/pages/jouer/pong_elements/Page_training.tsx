import React, { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../../../contexts/socketContext';
import { GameContext } from '../../../contexts/gameContext';
import { useKeyPress } from '../../../hooks/useKeyPress';
import { Status, User } from '../interfaces/constantes';
import Jeux from './Jeux';

const Canvas_server: React.FC<{}> = () => {

	let canvasRef = useRef<HTMLCanvasElement | null>( null );
	let context = React.useRef<CanvasRenderingContext2D | null>( null );

	const [ width ] = useState( 1127 );
	const [ height ] = useState( 600 );
	const [ heightCanvas, setHeightCanvas ] = useState( height );

	const socket = useContext( SocketContext );
	const gameContext = useContext( GameContext );
	const [ instanceGame ] = useState( new Jeux( width, height, User.HOST, true, gameContext.isBonusEnabled ) )

	const [ score1, setScore1 ] = useState( 0 );
	const [ score2, setScore2 ] = useState( 0 );

	// Keyboard
	const enterPress = useKeyPress( "Enter" );

	useEffect( () => {
		const interval = setInterval( () => {

			instanceGame.update();
			setScore1( instanceGame.player1.getScore() );
			setScore2( instanceGame.player2.getScore() );
			if ( canvasRef.current ) {
				context.current = canvasRef.current.getContext( '2d' );
				const ctx = context.current;
				let canvaContainer = document.getElementById( 'canvas' );
				if ( canvaContainer )
					setHeightCanvas( canvaContainer!.clientHeight );  //to responsive Paddle move
				instanceGame.display( ctx );
			}
			socket?.emit( 'updatePongGameplay', [ gameContext.gameID, instanceGame.sendSocket() ] );

		}, 45 );
		return () => clearInterval( interval );
	}, [] );

	// ramdomly Sprite every 5000 ms
	useEffect( () => {
		const interval = setInterval( () => {
			instanceGame.addRandomSprite();
		}, 7000 );
		return () => clearInterval( interval );
	}, [] );

	// send when Player's score is update
	useEffect( () => {
		let scores = [
			instanceGame.player1.getScore(),
			instanceGame.player2.getScore(),
		]
		socket?.emit( 'updateInGameScore', [ gameContext.gameID, scores ] );
		const winner: number = instanceGame.winner();
		if ( winner !== 0 ) {
			// there is a winner
			if ( winner === 1 ) {
				instanceGame.setInfo( "You Win !" );
			} else {
				instanceGame.setInfo( "You are a loser !" );
			}
			socket?.emit( 'endGameSignal', [ gameContext.gameID, winner ] );
		}
	}, [ score1, score2 ] );

	useEffect( () => {
		if ( enterPress ) {
			if ( instanceGame.status !== Status.FINISH ) {
				socket?.emit( 'startGameplay', gameContext.gameID );
				instanceGame.starting();
			}
		}
	}, [ enterPress ] );

	return (
		<div id="container-canvas">
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
					instanceGame.movePlayer1( event.nativeEvent.offsetY.valueOf(), heightCanvas );
				}}
			></canvas>
		</div>
	);
};
export default Canvas_server;
