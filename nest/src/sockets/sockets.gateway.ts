import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IMessages } from '../chat/interfaces/messages.interface';
import { IOnlineUser } from './interfaces/onlineUser.interface';
import { INewChannel, IEditChannel, IEditChannelUser } from './interfaces/channel.interfaces';
import { IGame, IOnlineGame, IInviteUserInGame } from './interfaces/game.interfaces';
import { EGameStatus } from './interfaces/EGameStatus.inferface';

enum EUserEditAction {
	Mute,
	Ban,
	Kick,
	Role,
}

let OnlineUsers: IOnlineUser[] = [];
let OnlineGames: IOnlineGame[] = [];

// * mandatory to allow any origin for cors or API call from front to back will be rejected
@WebSocketGateway( {
	cors: {
		origin: '*',
	},
	namespace: '/salmong',
} )
export class SocketsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() wss: Server;

	private logger: Logger = new Logger( 'ChatGateway' );

	afterInit( server: Server ): void {
		this.logger.log( 'Initialized!' );
	}

	// * detects when a user disconnects voluntarily or not
	handleDisconnect( client: Socket ): void {
		this.logger.log( `Client disconnected: ${client.id}` );
		let clientLogin: string;
		for ( let i: number = 0; i < OnlineUsers.length; i++ ) {
			if ( OnlineUsers[ i ].socketID === client.id ) {
				clientLogin = OnlineUsers[ i ].login;
				OnlineUsers.splice( i, 1 );
				break;
			}
		}
		this.wss.emit( 'OnlineUsersToClient', OnlineUsers );

		// ! in case host disconnects during a game
		let GameToEnd: IOnlineGame = OnlineGames.find( ( game ) => game.gameOwner === clientLogin );
		if ( GameToEnd ) {
			let i: number = OnlineGames.indexOf( GameToEnd );
			let users: string[] = [];
			users.push( GameToEnd.gameOwner );
			if ( OnlineGames[ i ].gamePlayer && OnlineGames[ i ].gamePlayer !== '' && OnlineGames[ i ].gamePlayer !== 'Computer' )
				users.push( OnlineGames[ i ].gamePlayer );
			if ( OnlineGames[ i ].gameWatcher ) {
				for ( let j = 0; j < OnlineGames[ i ].gameWatcher.length; j++ ) {
					if ( OnlineGames[ i ].gameWatcher[ j ] !== '' )
						users.push( OnlineGames[ i ].gameWatcher[ j ] );
				}
			}
			for ( let k = 0; k < OnlineUsers.length; k++ ) {
				for ( let m = 0; m < users.length; m++ ) {
					if ( OnlineUsers[ k ].login === users[ m ] )
						OnlineUsers[ k ].status = 'online';
				}
			}
			this.wss.emit( 'OnlineUsersToClient', OnlineUsers );
			this.wss.emit( 'gameDeleted', GameToEnd.gameId );
			OnlineGames.splice( i, 1 );
			this.wss.emit( 'OnlineGamesToClient', OnlineGames );
			client.leave( GameToEnd.gameId );
		}
	}

	// * detects when a new user is connected
	handleConnection( client: Socket, ...args: any[] ): void {
		this.logger.log( `Client connected: ${client.id}` );
	}

	// * message transmission event
	@SubscribeMessage( 'msgToServer' )
	handleMessage( client: Socket, message: IMessages ): void {
		this.wss.in( message.channelId.toString() ).emit( 'msgToClient', message, message.channelId );
	}

	/*
	* online / offline / in game status event
	! For some reason removing "client:Socket" will cause socket.io to generate a "circual reference" error
	! even if this value is never used.
	*/
	@SubscribeMessage( 'newUserFromClient' )
	handleNewUsers( client: Socket, newUser: IOnlineUser ): void {

		for ( let i: number = 0; i < OnlineUsers.length; i++ ) {

			if ( OnlineUsers[ i ].login === newUser.login ) {
				OnlineUsers[ i ].status = newUser.status;
				this.wss.emit( 'OnlineUsersToClient', OnlineUsers );
				this.logger.log( `client ${newUser.socketID} with login ${newUser.login} is back again` );
				return;
			}
		}
		OnlineUsers.push( newUser );
		this.wss.emit( 'OnlineUsersToClient', OnlineUsers );
	}

	// * Send list of all online users
	@SubscribeMessage( 'clientRequestOnlineUsers' )
	handleUsersListRequest( client: Socket ): void {
		this.wss.emit( 'OnlineUsersToClient', OnlineUsers );
	}

	// * join a channel
	@SubscribeMessage( 'joinRoom' )
	handleRoomJoin( client: Socket, [ room, roomType ]: [ string, string ] ): void {
		client.join( room );
		this.wss.emit( 'updateCtrlPannel', room );
		if ( roomType === 'public' )
			this.wss.emit( 'updateJoinedRooms' );
	}

	// * leave a channel
	@SubscribeMessage( 'leaveRoom' )
	handleRoomLeave( client: Socket, room: string ): void {
		client.leave( room );
		client.broadcast.emit( 'updateCtrlPannel', room );
	}

	// * channel creation event
	@SubscribeMessage( 'createChannel' )
	handleCreateChannel( client: Socket, newChannel: INewChannel ): void {
		this.wss.emit( 'channelCreated', newChannel );
		if ( !newChannel.isPrivate )
			this.wss.emit( 'roomCreated', newChannel );
	}

	// * channel deletion event
	@SubscribeMessage( 'deleteChannel' )
	handleDeleteChannel( client: Socket, delChannel: IEditChannel ): void {
		this.wss.emit( 'channelDeleted', delChannel );
		this.wss.emit( 'roomDeleted', delChannel );
	}

	// * mute / ban / role / kick
	// ! we use an array of arg as nestjs does not seem able to manage multiple arguments with socket.emit
	@SubscribeMessage( 'userEdit' )
	handleMuteUser( client: Socket, [ userEditted, action ]: [ IEditChannelUser, EUserEditAction ] ): void {
		switch ( action ) {
			case EUserEditAction.Mute:
				this.wss.emit( 'userMute', userEditted );
				this.wss.emit( 'updateCtrlPannel', userEditted );
				break;
			case EUserEditAction.Ban:
				this.wss.emit( 'userBan', userEditted );
				this.wss.emit( 'updateCtrlPannel' );
				break;
			case EUserEditAction.Kick:
				this.wss.emit( 'userKickOut', userEditted );
				this.wss.emit( 'updateCtrlPannel' );
				break;
			case EUserEditAction.Role:
				this.wss.emit( 'updateCtrlPannel', userEditted );
				break;
			default:
				this.logger.log( 'user edit action not recognized!' );
		}
	}
	// ! --------------------------------------------------------------------------------
	// !                             GAME EVENTS
	// ! --------------------------------------------------------------------------------

	// * Update position of all sprites, ball and player1 position during game
	@SubscribeMessage( 'updatePongGameplay' )
	handleUpdatePongGameplay( client: Socket, [ gameID, gameData ]: [ string, IGame ] ): void {
		this.wss.in( gameID ).emit( 'pongGameplayData', gameData );
	}

	// * Start game
	@SubscribeMessage( 'startGameplay' )
	handleStartGame( client: Socket, gameID: string ): void {
		this.wss.in( gameID ).emit( 'gameStarted' );
	}

	// * Update score during a game
	@SubscribeMessage( 'updateInGameScore' )
	handleUpdateInGameScore( client: Socket, [ gameID, scores ]: [ string, [ number, number ] ] ): void {
		this.wss.in( gameID ).emit( 'InGameScoresUpdated', scores );
		if ( scores[ 0 ] < 10 && scores[ 1 ] < 10 )
			this.wss.in( gameID ).emit( 'newPoint' );

		for ( let i: number = 0; i < OnlineGames.length; i++ ) {
			if ( OnlineGames[ i ].gameId === gameID ) {
				OnlineGames[ i ].scoreOwner = scores[ 0 ];
				OnlineGames[ i ].scorePlayer = scores[ 1 ];
				if ( ( OnlineGames[ i ].scoreOwner === 10 || OnlineGames[ i ].scorePlayer === 10 )
					&& OnlineGames[ i ].gamePlayer !== "Computer" ) {
					this.wss.in( gameID ).emit( "gameEnded", OnlineGames[ i ] );
				}
				break;
			}
		}
		this.wss.emit( 'OnlineGamesToClient', OnlineGames );
	}

	// * Update human player2 paddle position
	@SubscribeMessage( 'updatePaddlePlayer2' )
	handleUpdatePaddlePlayer2( client: Socket, [ player2PaddlePos, gameID ]: [ number, string ] ): void {
		this.wss.in( gameID ).emit( 'player2PaddleUpdated', player2PaddlePos );
	}

	@SubscribeMessage( 'endGameSignal' )
	handleEndGameMessage( client: Socket, [ gameID, winStatus ]: [ string, number ] ) {
		this.wss.in( gameID ).emit( 'gameHasEnded', winStatus );
	}

	// ! --------------------------------------------------------------------------------
	// !                             GAME MENU
	// ! --------------------------------------------------------------------------------

	// * Send list of all games currently played
	@SubscribeMessage( 'clientRequestOnlineGames' )
	handleGameListRequest( socket: Socket ): void {
		this.wss.emit( 'OnlineGamesToClient', OnlineGames );
	}

	// * game creation event
	@SubscribeMessage( 'createGame' )
	handleCreate( client: Socket, newGame: IOnlineGame ): void {

		OnlineGames.push( newGame );
		for ( let i: number = 0; i < OnlineUsers.length; i++ ) {
			if ( OnlineUsers[ i ].login === newGame.gameOwner ) {
				OnlineUsers[ i ].status = 'Playing';
				this.wss.emit( 'OnlineUsersToClient', OnlineUsers );
				break;
			}
		}
		client.join( newGame.gameId );
		this.wss.in( newGame.gameId ).emit( 'inGamePlayersUpdated', newGame.gameOwner, 'host' );
		this.wss.emit( 'gameCreated', OnlineGames, newGame );
	}

	// * delete game
	@SubscribeMessage( 'deleteGame' )
	handleDeleteGame( client: Socket, delGame: IOnlineGame ): void {
		this.wss.emit( 'gameDeleted', delGame );
	}

	// * Game join / leave
	@SubscribeMessage( 'joinGame' )
	handleGameJoin( client: Socket, game: string ): void {
		client.join( game );

		let userLogin = OnlineUsers.find( ( user ) => user.socketID === client.id )?.login;
		for ( let i = 0; i < OnlineGames.length; i++ ) {
			if ( OnlineGames[ i ].gameId === game ) {
				OnlineGames[ i ].gamePlayer = userLogin;
				break;
			}
		}
		for ( let i: number = 0; i < OnlineUsers.length; i++ ) {
			if ( OnlineUsers[ i ].socketID === client.id ) {
				OnlineUsers[ i ].status = 'Playing';
				break;
			}
		}
		this.wss.emit( 'OnlineUsersToClient', OnlineUsers );
		this.wss.emit( 'OnlineGamesToClient', OnlineGames );
	}

	// * Send a event to exit modal and switch to game page when the team is complete
	@SubscribeMessage( 'teamIsComplete' )
	handleTeamIsComplete( client: Socket, gameID: string ): void {
		for ( let i = 0; i < OnlineGames.length; i++ ) {
			if ( OnlineGames[ i ].gameId === gameID ) {
				if ( OnlineGames[ i ].gamePlayer !== '' && OnlineGames[ i ].gameOwner !== '' ) {
					OnlineGames[ i ].gameStatus = EGameStatus.inGame;
					this.wss.in( gameID ).emit( 'teamIsComplete', gameID );
					this.wss.emit( 'OnlineGamesToClient', OnlineGames );
					this.wss.in( gameID ).emit( 'inGamePlayersUpdated', OnlineGames[ i ].gamePlayer, 'player' );
					this.wss.in( gameID ).emit( 'inGamePlayersUpdated', OnlineGames[ i ].gameOwner, 'host' );
				}
				break;
			}
		}
	}

	// * watch Game
	@SubscribeMessage( 'watchGame' )
	handleWatchGame( client: Socket, game: string ): void {
		client.join( game );
		let userLogin = OnlineUsers.find( ( user ) => user.socketID === client.id )?.login;
		for ( let i = 0; i < OnlineGames.length; i++ ) {
			if ( OnlineGames[ i ].gameId === game ) {
				OnlineGames[ i ].gameWatcher.push( userLogin );
				// ! sale mais ca marche
				this.wss.in( game ).emit( 'inGamePlayersUpdated', OnlineGames[ i ].gamePlayer, 'player' );
				this.wss.in( game ).emit( 'inGamePlayersUpdated', OnlineGames[ i ].gameOwner, 'host' );
				break;
			}
		}
		for ( let i: number = 0; i < OnlineUsers.length; i++ ) {
			if ( OnlineUsers[ i ].socketID === client.id ) {
				OnlineUsers[ i ].status = 'Watching';
				break;
			}
		}
		this.wss.emit( 'OnlineUsersToClient', OnlineUsers );
		this.wss.emit( 'OnlineGamesToClient', OnlineGames );
	}

	// * invite a user to join a game
	@SubscribeMessage( 'inviteUserInGame' )
	handleInviteUserInGame( client: Socket, invite: IInviteUserInGame ): void {
		this.wss.emit( 'inviteUserInGame', invite );
	}

	/*
	 * leave a game - if it is the player hosting the game - resets all and delete the game
	 */
	@SubscribeMessage( 'leaveGame' )
	handleGameLeave( client: Socket, [ game, gameHost ]: [ string, string ] ): void {

		for ( let i: number = 0; i < OnlineGames.length; i++ ) {
			if ( OnlineGames[ i ].gameOwner === gameHost ) {
				let users: string[] = [];
				users.push( gameHost );
				if ( OnlineGames[ i ].gamePlayer && OnlineGames[ i ].gamePlayer !== '' && OnlineGames[ i ].gamePlayer !== 'Computer' )
					users.push( OnlineGames[ i ].gamePlayer );
				if ( OnlineGames[ i ].gameWatcher ) {
					for ( let j = 0; j < OnlineGames[ i ].gameWatcher.length; j++ ) {
						if ( OnlineGames[ i ].gameWatcher[ j ] !== '' )
							users.push( OnlineGames[ i ].gameWatcher[ j ] );
					}
				}
				for ( let k = 0; k < OnlineUsers.length; k++ ) {
					for ( let m = 0; m < users.length; m++ ) {
						if ( OnlineUsers[ k ].login === users[ m ] ) OnlineUsers[ k ].status = 'online';
					}
				}
				this.wss.emit( 'OnlineUsersToClient', OnlineUsers );

				this.wss.emit( 'gameDeleted', game );
				OnlineGames.splice( i, 1 );
				this.wss.emit( 'OnlineGamesToClient', OnlineGames );
			}
		}
		client.leave( game );
	}
}
