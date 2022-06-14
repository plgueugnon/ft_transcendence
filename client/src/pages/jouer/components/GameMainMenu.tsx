import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Grid, Header, Icon, Segment, Modal, Table, Popup } from 'semantic-ui-react';
import { GameContext } from '../../../contexts/gameContext';
import sword from '../../../images/swords.png';
import waitingFish from '../../../images/waitingFish.gif';
import inviteInGame from '../../../images/inviteInGame.gif';
import blobFish from '../../../images/blobfish-deal-with-it.gif';
import { IUsersPublic } from '../../../interfaces/usersPublicInterface';
import { SocketContext } from '../../../contexts/socketContext';
import { rand, randString, sleep } from '../../../globals/utils';
import { getUsersInfos } from '../../../requests/usersRequests';
import { IOnlineUser } from '../../../interfaces/userOnlineStatusInterface';
import { displayUserStatus } from '../../../components/connectionStatus';
import { AuthContext } from '../../../contexts/authContext';
import { IOnlineGame } from '../interfaces/onlineGameInterface';
import { EGameStatus } from '../interfaces/EGameStatusInterface';
import { User } from '../interfaces/constantes';
import { GameSettingsModal } from './GameSettingsModal';
import { RouteTrackerContext } from '../../../contexts/routeTrackerContext';
import { NotifContext } from '../../../contexts/notifContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_USER_SEARCH_PATH, REDIRECT_LOGIN_INVITE_FROM_CHAT, ACTION_TAG_INVITE_FROM_CHAT, REDIRECT_VALUE_INVITE, REDIRECT_VALUE_JOIN } from '../../../globals/constants';
// import sword from '../../../images/sword.png';

interface IGameUser {
	userName: string;
	userLogin: string;
	avatarUrl: string;
}

export enum EmodalType {
	RANDOM,
	INVITE,
	WATCHER,
}

interface IInviteUserInGame {
	gameId: string;
	senderLogin: string;
	receiverLogin: string;
}

// ! GAME MAIN MENU
export function GameMainMenu(): JSX.Element {
	// * contexts
	const socket = useContext( SocketContext );
	const gameContext = useContext( GameContext );
	const authContext = useContext( AuthContext );
	const routeTracker = useContext( RouteTrackerContext );
	const notifContext = useContext( NotifContext );

	// * Misc
	const [ gameUserList, setGameUserList ] = useState<IGameUser[]>( [] );
	const [ userConnectStatus, setUserStatus ] = useState<{ login: string; status: string }[]>( [] );
	const [ open, setOpen ] = useState<boolean>( false );
	const [ openUser, setOpenUser ] = useState<boolean>( false );
	const [ inviter, setInviter ] = useState<string>( '' );
	const [ modalType, setModalType ] = useState<EmodalType | undefined>( undefined );

	// Game settings modal (GSM)
	const [ isGsmCreation, setIsGsmCreation ] = useState<boolean>( false );
	const [ isGsmTraining, setIsGsmTraining ] = useState<boolean>( false );
	const [ isGsmInviteUser, setIsGsmInviteUser ] = useState<boolean>( false );
	const [ invitedLogin, setInvitedLogin ] = useState<string>('');

	// React
	const navigate = useNavigate();
	const location = useLocation();

	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => { mounted.current = false }
	}, [] );

	//* On gameContext context change
	// Join game if invited from chat
	useEffect( () => {
		if ( !location.search )
			return;

		const action = new URLSearchParams( location.search ).get( ACTION_TAG_INVITE_FROM_CHAT );
		const login = new URLSearchParams( location.search ).get( REDIRECT_LOGIN_INVITE_FROM_CHAT );

		if ( !action || !login )
			return;
		if ( gameContext.gameID.length ) // If joinded game, clean query string
			return;

		// Check if game is available
		if ( action === REDIRECT_VALUE_JOIN || action === REDIRECT_VALUE_INVITE )
		{
			if ( action === REDIRECT_VALUE_JOIN && !gameContext.gameList.length )
				return ;

			const gamesToJoin = gameContext.gameList.filter( game => game.gameOwner === login );

			// Someone invite us so join
			if ( gamesToJoin.length )
			{
				const gameToJoin: IOnlineGame = gamesToJoin[ 0 ];

				// Join game
				handleJoinThisGame( gameToJoin.gameId, gameToJoin.isBonusEnabled );
				setOpenUser( false );
			}
			else
			{
				if ( action === REDIRECT_VALUE_JOIN )
					notifContext.postNotif( { type: 'error', title: 'Erreur', content: "L'invitation a expiré." } );
				else if ( action === REDIRECT_VALUE_INVITE )
					handleInviteUserInGame( login, false, true );
			}
		}
	}, [ gameContext, location.search ] );

	// * get list of online users
	useEffect( () => {
		const getUserData = async () => {
			const userProfiles = await getUsersInfos();
			if ( !mounted.current )
				return;
			let userList: IGameUser[] = [];
			if ( userProfiles ) {
				userProfiles.forEach( ( userProfile: IUsersPublic ) => {
					userList.push( {
						userName: userProfile.name,
						userLogin: userProfile.login,
						avatarUrl: userProfile.avatarUrl,
					} );
				} );
			}
			setGameUserList( userList );
		}
		getUserData();
		let listOnlineUsers: { login: string, status: string }[] = [];
		socket?.off( 'OnlineUsersToClient' );
		socket?.on( 'OnlineUsersToClient', function ( OnlineUsers: IOnlineUser[] ) {
			OnlineUsers.forEach( element => {
				listOnlineUsers.push( { login: element.login, status: element.status } );
			} );
			if ( !mounted.current )
				return;
			setUserStatus( listOnlineUsers );
		} );
		return (
			gameContext.setInGame( true )
		)
	}, [ userConnectStatus ] );

	// * socket emit to update list of online users
	useEffect( () => {
		socket?.emit( "clientRequestOnlineUsers" );
	}, [] );

	// * get list of online games
	useEffect( () => {
		let listOnlineGames: IOnlineGame[] = [];
		socket?.off( "OnlineGamesToClient" );
		socket?.on( "OnlineGamesToClient", function ( OnlineGames: IOnlineGame[] ) {
			OnlineGames.forEach( element => {
				listOnlineGames.push( element );
			} );
			if ( !mounted.current )
				return;
			gameContext.setGameList( listOnlineGames );
		} );
	}, [ gameContext.gameList ] );

	// * socket emit to update list of online games
	useEffect( () => {
		socket?.emit( "clientRequestOnlineGames" );
	}, [] );

	// * Listen creation of new game
	socket?.off( 'gameCreated' );
	socket?.on( 'gameCreated', function ( updatedGameList: IOnlineGame[], newGame: IOnlineGame ) {
		// ! A tester mais a priori pas d'affichage du component si je suis le createur du jeux => uniquement wait modal
		if ( authContext.login !== newGame.gameOwner ) {
			// gameList.push(newGame)
			if ( !mounted.current )
				return;
			gameContext.setGameList( updatedGameList );
		}
	} )

	// * Listen invitation for a new game
	socket?.off( 'inviteUserInGame' );
	socket?.on( 'inviteUserInGame', async function ( invite: IInviteUserInGame ) {
		// *ajout de la condition inviter = '' comme ca, si on recoit plusieurs invites, on garde la premiere et annule les autres
		if ( authContext.login === invite.receiverLogin && inviter === '' && open === false ) {
			// setGameId( invite.gameId );
			if ( !mounted.current )
				return;
			routeTracker.setGameID( invite.gameId );
			await gameContext.setGameID( invite.gameId );
			setInviter( invite.senderLogin );
			setModalType( EmodalType.INVITE );
			setOpenUser( true );
		}
	} )

	// * listen if the game team is complete
	socket?.off( 'teamIsComplete' );
	socket?.on( 'teamIsComplete', async function ( game: string ) {
		if ( game === gameContext.gameID ) {
			gameContext.setInGame( false );
		}
	} )

	async function handleWatchThisGame( gameId: string, gameStatus: EGameStatus, isBonusEnabled: boolean ) {
		gameContext.setIsBonusEnabled( isBonusEnabled );
		gameContext.setGameRole( User.WATCHER );
		routeTracker.setGameID( gameId );
		await gameContext.setGameID( gameId );
		socket?.emit( 'watchGame', gameId.toString() );
		setModalType( EmodalType.WATCHER );
		if ( gameStatus === EGameStatus.inGame ) {
			gameContext.setInGame( false );
			return;
		}
		setOpen( true );
	}

	async function handleJoinThisGame( gameId: string, isBonusEnabled: boolean ) {
		gameContext.setIsBonusEnabled( isBonusEnabled );
		socket?.emit( 'joinGame', gameId.toString() );
		socket?.emit( 'teamIsComplete', gameId.toString() );
		gameContext.setGameRole( User.PLAYER );
		routeTracker.setGameID( gameId );
		await gameContext.setGameID( gameId );
		await gameContext.setInGame( false );

	}

	// ! En fonction du premier qui appuie sur join random alors que pas de game cree, HOST ou PLAYER
	function handleJoinRandomGame() {
		setModalType( EmodalType.RANDOM );
		setOpen( true );
		for ( let i = 0; i < gameContext.gameList.length; i++ ) {
			if ( gameContext.gameList[ i ].gamePlayer === "" ) {
				handleJoinThisGame( gameContext.gameList[ i ].gameId, gameContext.gameList[ i ].isBonusEnabled );
				return;
			}
		}
		const random = rand( 1, 3 ) - 1;
		handleCreateNewGame( false, random ? true : false ); // randomly set bonuses or not
	}

	async function handleTrainingGame( isBonusEnabled: boolean ) {
		gameContext.setTrainingGame( true );
		handleCreateNewGame( true, isBonusEnabled );
	}

	function handleCancelJoinRandomGame() {
		setOpen( false );
		socket?.emit( 'leaveGame', [ gameContext.gameID, authContext.login ] );
		gameContext.setInGame( true );
	}

	// ! ajouter function gen random game id
	function handleCreateNewGame( trainingGame: boolean, isBonusEnabled: boolean ): string {
		gameContext.setIsBonusEnabled( isBonusEnabled );

		let newGame: IOnlineGame = {
			gameId: randString( 6 ),
			gameStatus: EGameStatus.open,
			gameOwner: authContext.login,
			gamePlayer: '',
			gameWatcher: [],
			scoreOwner: 0,
			scorePlayer: 0,
			isBonusEnabled: isBonusEnabled,
		};
		routeTracker.setGameID( newGame.gameId );
		gameContext.setGameID( newGame.gameId );
		setModalType( EmodalType.RANDOM );
		gameContext.setGameRole( User.HOST );
		if ( trainingGame ) {
			newGame.gamePlayer = 'Computer';
			newGame.gameStatus = EGameStatus.inGame;
			socket?.emit( 'createGame', newGame );
			setOpen( false )
			gameContext.setInGame( false );
		}
		else {
			socket?.emit( 'createGame', newGame );
			setOpen( true )
		}
		return ( newGame.gameId )
	}

	function handleInviteUserInGame( userLogin: string, trainingGame: boolean, isBonusEnabled: boolean ) {
		let newGame: string = handleCreateNewGame( trainingGame, isBonusEnabled );
		const inviteUser: IInviteUserInGame = {
			gameId: newGame,
			senderLogin: authContext.login,
			receiverLogin: userLogin,
		};
		socket?.emit( 'inviteUserInGame', inviteUser );
	}

	function handleAcceptGameInvitation() {
		if ( gameContext.gameID && gameContext.gameID && gameContext.gameID ) {
			const isBonusEnabled: boolean | undefined = gameContext.gameList.filter( ( game ) => game.gameId === gameContext.gameID )[ 0 ]?.isBonusEnabled;
			if ( isBonusEnabled !== undefined ) {
				handleJoinThisGame( gameContext.gameID, isBonusEnabled )
				setOpenUser( false );
			}
			else {
				setInviter( '' );
				setOpenUser( false );
				notifContext.postNotif( { type: 'error', title: 'Erreur', content: 'Désolé la partie a été supprimée par son hôte !' } );
			}
		}
	}

	function handleDeclineGameInvitation() {
		setOpenUser( false );
		setInviter( '' );
	}

	// ! JOIN BUTTON
	function joinThisGameButton( props: IOnlineGame ): JSX.Element {
		if ( props.gamePlayer === "" ) {
			return ( <Icon color="black" size="big" name="gamepad" className="pointer"
				onClick={() => handleJoinThisGame( props.gameId, props.isBonusEnabled )} /> );
		}
		else {
			return ( <Icon color="grey" size="big" name="gamepad" /> );
		}
	}

	function inviteUserInGameButton( login: string, userConnectStatus: { login: string, status: string }[] ): JSX.Element {
		for ( let i = 0; i < userConnectStatus.length; i++ ) {
			if ( userConnectStatus[ i ].login === login ) {
				if ( userConnectStatus[ i ].status === "online" ) {
					const	userLogin = ( ' ' + login ).slice( 1 );
					return (
						<Popup wide
							content='Inviter en duel !'
							position="top center"
							trigger={
								<img src={inviteInGame} className="pointer" alt="fight"
									onClick={() => {
										if ( !isGsmInviteUser ) {
											setInvitedLogin( login );
											setIsGsmInviteUser( true )
										}
									}}
								/>
							}
						/>
					);
				}
			}
		}
		return (
			<Popup wide
				trigger={<img src={blobFish} alt="blob fish" />}
				content='Parti à la pêche... Indisponible.'
				position="top center"
			/>
		);
	}

	const buttonStyle = {
		width: '90%',
		height: '50px',
		margin: '10px',
		alignSelf: 'center',
	}

	// ! USER ITEM
	function UserItem( props: IGameUser ): JSX.Element {
		if ( props.userLogin === authContext.login )
			return ( <></> )
		else
			return (
				<Segment>
					<Grid verticalAlign="middle" textAlign="center" columns={4}>
						<Grid.Row>
							<Grid.Column>
								{<img src={props.avatarUrl} alt="avatar" className="ui avatar image" />}
							</Grid.Column>
							<Grid.Column className='pointer'
								onClick={() => {
									navigate( APP_USER_SEARCH_PATH + '/' + props.userLogin + '#jouer' )
								}} >
								{props.userName}
							</Grid.Column>
							<Grid.Column>
								<Table basic='very'>
									<tbody>
										<tr>
											{displayUserStatus( props.userLogin, userConnectStatus )}
										</tr>
									</tbody>
								</Table>
							</Grid.Column>
							<Grid.Column>
								{inviteUserInGameButton( props.userLogin, userConnectStatus )}
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Segment>
			)
	}

	let j = 0;
	// ! USER LIST
	function UserList( props: any ) {
		return (
			<div>
				{gameUserList && gameUserList.map( ( props: IGameUser ) =>
					<UserItem key={j++}
						userName={props.userName}
						userLogin={props.userLogin}
						avatarUrl={props.avatarUrl}
					/>
				)
				}
			</div>
		)
	}

	// ! GAME ITEM
	function GameItem( props: IOnlineGame ): JSX.Element {
		return (
			<Segment>
				<Grid verticalAlign="middle" textAlign="center" columns={3}>
					<Grid.Row stretched>
						<Grid.Column>
							Game {props.gameId}
						</Grid.Column>
						<Grid.Column>
							<Icon name='eye' size="big" className="pointer"
								onClick={() => handleWatchThisGame( props.gameId, props.gameStatus, props.isBonusEnabled )}
							/>
						</Grid.Column>
						<Grid.Column>
							{joinThisGameButton( props )}
							{/* <Icon name='gamepad' size="big" /> */}
						</Grid.Column>
					</Grid.Row>
					<Grid.Row stretched>
						<Grid.Column>
							Player 1
						</Grid.Column>
						<Grid.Column>
							{props.gameOwner}
						</Grid.Column>
						<Grid.Column>
							{props.scoreOwner}
						</Grid.Column>
					</Grid.Row>
					<Grid.Row>
						<img src={sword} alt="sword" width="50" height="50" />
					</Grid.Row>
					<Grid.Row stretched>
						<Grid.Column>
							{props.gamePlayer !== "" ? "Player 2" : "Waiting for player 2"}
							{/* Player 2 */}
						</Grid.Column>
						{props.gamePlayer !== "" ?
							<Grid.Column>
								{props.gamePlayer}
							</Grid.Column> :
							""
						}
						<Grid.Column>
							{props.gamePlayer !== "" ? props.scorePlayer :
								<img src={waitingFish} alt="waiting fish" />
							}
						</Grid.Column>
					</Grid.Row>
				</Grid >
			</Segment>
		);
	}


	let i = 0;
	// ! GAME LIST
	function GameList( props: any ): JSX.Element {
		return (
			<div>
				{gameContext.gameList && gameContext.gameList.map( ( props: IOnlineGame ) =>
					<GameItem key={i++}
						gameId={props.gameId}
						gameStatus={props.gameStatus}
						gameOwner={props.gameOwner}
						gamePlayer={props.gamePlayer}
						gameWatcher={props.gameWatcher}
						scoreOwner={props.scoreOwner}
						scorePlayer={props.scorePlayer}
						isBonusEnabled={props.isBonusEnabled}
					/>
				)}
			</div>
		)
	}

	return (
		<Grid columns={3}>
			<Grid.Column width='4'>
				<Segment>
					<GameSettingsModal
						trigger={
							<Button style={buttonStyle} size="medium" className="inGameButton" onClick={() => setIsGsmCreation( true )}>
								Créer une nouvelle partie
							</Button>
						}
						onSelect={( isBonusEnabled: boolean ) => handleCreateNewGame( false, isBonusEnabled )}
						isModalOpen={isGsmCreation}
						setIsModalOpen={setIsGsmCreation}
					/>
				</Segment>
				<Segment>
					<Button style={buttonStyle} size="medium" className="inGameButton" onClick={handleJoinRandomGame}>
						Rejoindre une partie aléatoire
					</Button>
				</Segment>
				<Segment>
					<GameSettingsModal
						trigger={
							<Button style={buttonStyle} size="medium" className="inGameButton" onClick={() => setIsGsmTraining( true )}>
								S'entrainer avec un bot
							</Button>
						}
						onSelect={( isBonusEnabled: boolean ) => handleTrainingGame( isBonusEnabled )}
						isModalOpen={isGsmTraining}
						setIsModalOpen={setIsGsmTraining}
					/>
				</Segment>
			</Grid.Column>
			<Grid.Column stretched width='6'>
				<Segment>
					<Header textAlign="center">
						Liste des parties
					</Header>
					<GameList
					// onlineGames={ gameContext.gameList }
					// setOnlineGames={ gameContext.setGameList }
					/>
				</Segment>
			</Grid.Column>
			<Grid.Column stretched width='6'>
				<Segment>
					<Header textAlign="center">
						Liste des Joueurs
					</Header>
					<UserList />
					<GameSettingsModal
						onSelect={( isBonusEnabled: boolean ) => handleInviteUserInGame( invitedLogin, false, isBonusEnabled )}
						isModalOpen={isGsmInviteUser}
						setIsModalOpen={setIsGsmInviteUser}
					/>
				</Segment>
			</Grid.Column>
			{/* modal pour rejoindre une partie random */}
			<Modal
				closeOnDimmerClick={false}
				onClose={() => setOpen( false )}
				onOpen={() => setOpen( true )}
				open={open}
			>
				<Modal.Header>Merci de patienter uesh</Modal.Header>
				<Modal.Content  >
					<Modal.Description>
						<Header>
							{modalType === EmodalType.RANDOM && "Nous recherchons un adversaire pour toi !"}
							{modalType === EmodalType.INVITE && "Nous avons envoyé ta demande d'invitation à jouer!"}
							{modalType === EmodalType.WATCHER && "Il manque des joueurs pour commencer la partie !"}
						</Header>
					</Modal.Description>
					<br />
					<img src={waitingFish} width='100%' alt="waiting fish" />
					<Header>
						La partie se lancera automatiquement quand tous les joueurs auront rejoint la partie.
					</Header>
					<br />
					Si tu souhaites quitter le jeu, clique sur annuler.
				</Modal.Content>
				<Modal.Actions>
					<Button color='red' onClick={handleCancelJoinRandomGame}>
						Annuler
					</Button>
				</Modal.Actions>
			</Modal>
			{/* modal quand on t'invite nominativement a jouer*/}
			<Modal
				closeOnDimmerClick={false}
				onClose={() => setOpenUser( false )}
				onOpen={() => setOpenUser( true )}
				open={openUser}
			>
				<Modal.Header>
					Un joueur t'invite a jouer une partie !
				</Modal.Header>
				<Modal.Content>
					<Modal.Description>
						<Header>
							Tu veux faire une partie de Pong avec {inviter} ?
						</Header>
					</Modal.Description>
					<br />
					<img src={inviteInGame} alt="fight" />
				</Modal.Content>
				<Modal.Actions>
					<Button color='green' onClick={handleAcceptGameInvitation}>
						Lancer la partie
					</Button>
					<Button color='red' onClick={handleDeclineGameInvitation}>
						Décliner l'invitation
					</Button>
				</Modal.Actions>
			</Modal>
		</Grid>
	);
}
