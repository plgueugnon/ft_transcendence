import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Grid, Header, PopupContent, Segment } from 'semantic-ui-react';
import { AuthContext } from '../../../contexts/authContext';
import { SocketContext } from '../../../contexts/socketContext';
import { GameContext } from '../../../contexts/gameContext';
import { User } from '../interfaces/constantes';
import Page_admin from './Page_admin';
import Page_player from './Page_player';
import Page_spectator from './Page_spectator';
import Page_training from './Page_training';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotifContext } from '../../../contexts/notifContext';

const Pong = ( props: any ): JSX.Element => {
	// * Contexts
	const socket = useContext( SocketContext );
	const authContext = useContext( AuthContext );
	const gameContext = useContext( GameContext );
	const navigate = useNavigate();
	const location = useLocation();
	const notifContext = useContext( NotifContext );

	// * In game score
	const [ player1ID, setPlayer1ID ] = useState<string>( 'incoming' );
	const [ player2ID, setPlayer2ID ] = useState<string>( 'incoming' );
	const [ score1, setScore1 ] = useState<number>( 0 );
	const [ score2, setScore2 ] = useState<number>( 0 );

	// * Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );

	const buttonStyle = {
		width: '100%',
		height: '50px',
		// margin: '10px',
		alignSelf: 'center',
	}

	function handleExitGame() {
		socket?.emit( 'leaveGame', [ gameContext.gameID, authContext.login ] );
		gameContext.setInGame( true );
		if ( gameContext.trainingGame )
			gameContext.setTrainingGame( false );
	}

	socket?.off( 'inGamePlayersUpdated' );
	socket?.on( 'inGamePlayersUpdated', function ( userLogin: string, status: string ) {
		if ( !mounted.current )
			return;
		if ( status === 'host' ) {
			// if ( !mounted.current )
			// 	return;
			setPlayer1ID( userLogin );
			if ( gameContext.trainingGame )
				setPlayer2ID( "Computer" );
		}
		else {
			// if ( !mounted.current )
			// 	return;
			setPlayer2ID( userLogin );
		}
	} );

	socket?.off( 'InGameScoresUpdated' );
	socket?.on( 'InGameScoresUpdated', function ( scores: [ number, number ] ) {
		setScore1( scores[ 0 ] );
		setScore2( scores[ 1 ] );
	} );

	// * listen if game is deleted
	socket?.off( 'gameDeleted' );
	socket?.on( 'gameDeleted', function ( game: string ) {
		if ( gameContext.gameRole === User.HOST )
			notifContext.postNotif( { type: 'info', title: 'Partie terminée', content: 'Vous venez de fermer votre partie.' } )
		else
			notifContext.postNotif( { type: 'info', title: 'Partie terminée', content: "La partie vient d'être fermée. Dommage..." } )
		if ( game === gameContext.gameID ) {
			if ( !mounted.current )
				return;
			gameContext.setInGame( true );
			gameContext.setGameID( '' );
			navigate( location.pathname + location.hash );
		}
	} );

	const displayScore = ( player1ID: string, score1: number, player2ID: string, score2: number ) => {
		return (
			<><Grid columns={2}>
				<Grid.Column width={8} floated="left">
					<Segment>
						<Header>
							{player1ID}: {score1}
						</Header>
					</Segment>
				</Grid.Column>
				<Grid.Column width={8} floated="right">
					<Segment>
						<Header>
							{player2ID}: {score2}
						</Header>
					</Segment>
				</Grid.Column>
			</Grid><br /></>
		)
	}

	if ( gameContext.gameRole === User.HOST ) {
		if ( gameContext.trainingGame )
			return (
				<>
					{displayScore( player1ID, score1, player2ID, score2 )}
					<Page_training />
					<br />
					<Button color="grey" style={buttonStyle} onClick={handleExitGame}>
						Arreter l'entrainement
					</Button>
				</>
			);
		else
			return (
				<>
					{displayScore( player1ID, score1, player2ID, score2 )}
					<Page_admin />
					<br />
					<Button color="grey" style={buttonStyle} onClick={handleExitGame}>
						Quitter la partie
					</Button>
				</>
			);
	} else if ( gameContext.gameRole === User.PLAYER )
		return (
			<>
				{displayScore( player1ID, score1, player2ID, score2 )}
				<Page_player />
				<br />
				<Button color="grey" style={buttonStyle} onClick={handleExitGame}>
					Quitter la partie
				</Button>
			</>
		);
	else
		return (
			<>
				{displayScore( player1ID, score1, player2ID, score2 )}
				<Page_spectator />
				<br />
				<Button color="grey" style={buttonStyle} onClick={handleExitGame}>
					Arreter de regarder la partie
				</Button>
			</>
		);
};
export default Pong;
