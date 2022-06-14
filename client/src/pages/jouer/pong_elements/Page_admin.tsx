import React, { useContext, useEffect, useRef, useState } from 'react'

import { SocketContext } from '../../../contexts/socketContext';
import { GameContext } from '../../../contexts/gameContext';
import { useKeyPress } from '../../../hooks/useKeyPress';
import { Status, User } from '../interfaces/constantes';
import { IGameHistory } from '../../../interfaces/gameHistoryInterface';
import { IGameScore } from '../../../interfaces/gameScore';
import { postGameScore } from '../../../requests/usersRequests';
import { IOnlineGame } from '../interfaces/onlineGameInterface';
import { postGameHistory } from '../../../requests/gameHistoryRequests';
import Jeux from './Jeux';

const Canvas_server: React.FC<{}> = () => {

	let canvasRef = useRef<HTMLCanvasElement | null>( null );
	let context = React.useRef<CanvasRenderingContext2D | null>( null );

	const [ width, setWidth ] = useState( 1127 )
	const [ height, setHeight ] = useState( 600 )
	const [ heightCanvas, setHeightCanvas ] = useState( height );

	const socket = useContext( SocketContext );
	const gameContext = useContext( GameContext );

	const [ instanceGame ] = useState( new Jeux( width, height, User.HOST, false, gameContext.isBonusEnabled ) )

	const [ score1, setScore1 ] = useState( 0 );
	const [ score2, setScore2 ] = useState( 0 );
	const [ winner, setWinner ] = useState( 0 );

	// Keyboard
	const enterPress = useKeyPress( "Enter" );

	useEffect( () => {
		const interval = setInterval( () => {

			instanceGame.update();
			setScore1( instanceGame.player1.getScore() );
			setScore2( instanceGame.player2.getScore() );
			setWinner( instanceGame.winner() );
			socket?.emit( 'updatePongGameplay', [ gameContext.gameID, instanceGame.sendSocket() ] );

			let canvaContainer = document.getElementById( 'canvas' );
			if ( canvaContainer )
				setHeightCanvas( canvaContainer!.clientHeight );  //to responsive Paddle move
			if ( canvasRef.current ) {
				context.current = canvasRef.current.getContext( '2d' );
				const ctx = context.current;;
				instanceGame.display( ctx );
			}
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

	useEffect( () => {
		if ( winner !== 0 ) {
			if ( instanceGame.winner() === 1 )
				instanceGame.setInfo( "You win !" );
			else
				instanceGame.setInfo( "You lose... LOSER !" );

			socket?.emit( 'endGameSignal', [ gameContext.gameID, winner ] );

			socket?.off( "gameEnded" )
			socket?.on( "gameEnded", function ( gameScore: IOnlineGame ) {
				if ( gameScore.scoreOwner > gameScore.scorePlayer ) {
					const score: IGameScore = {
						winnerLogin: gameScore.gameOwner,
						loserLogin: gameScore.gamePlayer,
					}
					const history: IGameHistory = {
						timeStamp: new Date().toString(),
						winnerLogin: gameScore.gameOwner,
						looserLogin: gameScore.gamePlayer,
						winnerScore: gameScore.scoreOwner,
						looserScore: gameScore.scorePlayer,
					}
					postGameScore( score )
					postGameHistory( history )
				}
				else {
					const score: IGameScore = {
						winnerLogin: gameScore.gamePlayer,
						loserLogin: gameScore.gameOwner,
					}
					const history: IGameHistory = {
						timeStamp: new Date().toString(),
						winnerLogin: gameScore.gamePlayer,
						looserLogin: gameScore.gameOwner,
						winnerScore: gameScore.scorePlayer,
						looserScore: gameScore.scoreOwner,
					}
					postGameScore( score )
					postGameHistory( history )
				}
			}
			);
		}
	}, [ winner ] );

	// send when Player's score is update
	useEffect( () => {
		let scores = [
			instanceGame.player1.getScore(),
			instanceGame.player2.getScore(),
		]
		socket?.emit( 'updateInGameScore', [ gameContext.gameID, scores ] );
	}, [ score1, score2 ] );


	useEffect( () => {
		if ( canvasRef.current ) {
			context.current = canvasRef.current.getContext( '2d' );
			const ctx = context.current;
			instanceGame.display( ctx );
		}
	}, [ instanceGame.player2.getPaddle().y ] )

	socket?.off( 'player2PaddleUpdated' );
	socket?.on( 'player2PaddleUpdated', function ( PosPaddlePlayer2: number ) {
		instanceGame.player2.getPaddle().move( PosPaddlePlayer2 );
	} )

	socket?.off( 'gameStarted' )
	socket?.on( 'gameStarted', function () {
		instanceGame.starting();
	} )

	useEffect( () => {
		if ( enterPress ) {
			if ( instanceGame.status !== Status.FINISH ) {
				socket?.emit( 'startGameplay', gameContext.gameID );
			}
		}
	}, [ enterPress ] )

	return (
		<div>
			<canvas id="canvas" width={width} height={height} style={{ width: "100%", height: "100%" }} ref={canvasRef}
				onMouseOver={event => { document.body.style.cursor = 'none'; }}
				onMouseOut={event => { document.body.style.cursor = 'default'; }}
				onMouseMove={event => {
					instanceGame.movePlayer1( event.nativeEvent.offsetY.valueOf(), heightCanvas );
				}}
			></canvas>
		</div> )

}
export default Canvas_server