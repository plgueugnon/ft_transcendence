import { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Grid, Header, Icon, Modal, Popup, Segment, Table } from 'semantic-ui-react';
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic';
import Buttons from '../../components/buttons';
import Containers from '../../components/containers';
import { ProfileCard } from '../../components/ProfileCard';
import ScreenTransitions from '../../components/screenTransitions';
import Text from '../../components/text';
import { AuthContext } from '../../contexts/authContext';
import { NotifContext } from '../../contexts/notifContext';
import { ELoginStatus, LoginMessage } from '../../elements/LoginMessage';
import { APP_LEADERBOARD_PATH, APP_PLAY_PATH, APP_PROFILE_PATH, APP_USER_SEARCH_PATH, SEMANTIC_ICON_LOADING } from '../../globals/constants';
import { IFriendInvite } from '../../interfaces/friendInviteInterface';
import { IUsersPublic } from '../../interfaces/usersPublicInterface';
import { getBlockedLogins, postBlock, postUnblock } from '../../requests/blocksRequests';
import { getFriendsLogins, getPendingInivtes, getSentInivtes, postFriendAccept, postFriendDeny, postFriendInvite } from '../../requests/friendsRequests';
import { getUserPublic } from '../../requests/usersRequests';
import coupleFight from '../../images/couple-fight.png';
import { IGameHistory } from '../../interfaces/gameHistoryInterface';
import { getGameHistoryByLogin } from '../../requests/gameHistoryRequests';
import { timeStampToString } from '../../globals/utils';
import { SocketContext } from '../../contexts/socketContext';
import { IOnlineUser } from '../../interfaces/userOnlineStatusInterface';
import { displayUserStatus } from '../../components/connectionStatus';

export function PublicProfilePage(): JSX.Element {
	//? HOOKS
	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );
	// Data
	const { login } = useParams();
	const [ userPublic, setUserPublic ] = useState<IUsersPublic | undefined>( undefined );
	const [ isUserNotFound, SetIsUserNotFound ] = useState<boolean>( false );
	const authContext = useContext( AuthContext );
	// Navigation
	const navigate = useNavigate();
	const location = useLocation();
	// Status friend
	const [ userRelationStatus, setUserRelationStatus ] = useState<'loading' | 'self' | 'none' | 'invite sent' | 'invite received' | 'friends'>( 'loading' );
	const [ friendIcon, setFriendIcon ] = useState<SemanticICONS>( 'user plus' );
	const [ friendIconPopup, setFriendIconPopup ] = useState<string>( '' );
	const [ relationMessage, setRelationMessage ] = useState<string>( '' );
	const [ isFriendIconDisable, setIsFriendIconDisable ] = useState<boolean>( true );
	const [ onHoverFriendIcon, setOnHoverFriendIcon ] = useState<SemanticICONS | undefined>( undefined );
	const [ isHoverFriendIcon, setIsHoverFriendIcon ] = useState<boolean>( false );
	// Status block
	const [ isUserBlocked, setIsUserBlocked ] = useState<boolean>( false );
	const [ blockIconCorner, setBlockIconCorner ] = useState<SemanticICONS>( 'times' );
	const [ isHoverBlockIcon, setIsHoverBlockIcon ] = useState<boolean>( false );
	// React
	const notifContext = useContext( NotifContext );
	// history match
	const [ gameHistory, setGameHistory ] = useState<IGameHistory[] | undefined>( undefined );
	const [ openMatchHistory, setOpenMatchHistory ] = useState( false );

	// * Socket & connection
	const socket = useContext( SocketContext );
	const [ userConnectStatus, setUserStatus ] = useState<{ login: string; status: string }[]>( [] );

	//* On userId changes
	useEffect( () => {
		setUserPublic( undefined );
		getUserRelation();
		if ( !login )
			navigate( APP_USER_SEARCH_PATH );
		else {
			getUserPublic( login ).then( ( response ) => {
				if ( !mounted.current )
					return;

				if ( response )
					setUserPublic( response );
				else
					SetIsUserNotFound( true );
			} );
		}
	}, [ login, location ] );

	//* On friendIconStatus change
	// Update all status dependencies
	useEffect( () => {
		setRelationMessage( '' );
		setIsFriendIconDisable( false );
		setOnHoverFriendIcon( undefined );

		switch ( userRelationStatus ) {
			case 'loading':
				setFriendIcon( 'circle notch' );
				setFriendIconPopup( 'Chargement...' );
				setIsFriendIconDisable( true );
				break;
			case 'none':
				setFriendIcon( 'user plus' );
				setFriendIconPopup( 'Ajouter en ami' );
				break;
			case 'invite sent':
				setFriendIcon( 'wait' );
				setFriendIconPopup( 'Invitation envoyée, click pour annuler.' );
				setOnHoverFriendIcon( 'times' );
				break;
			case 'invite received':
				setFriendIcon( 'question circle' );
				setFriendIconPopup( '' );
				setRelationMessage( `${userPublic?.name} vous a invité !` );
				break;
			case 'friends':
				setFriendIcon( 'heart' );
				setFriendIconPopup( "xoxo <3 (Click pour retirer l'ami)" );
				setRelationMessage( `${userPublic?.name} et vous êtes amis.` );
				setOnHoverFriendIcon( 'times' );
				break;
			case 'self':
				// Buttons are hidden so no need to set them values
				setRelationMessage( "Voici votre profil tel que le monde le voit. Pas mal non ? C'est francais." );
				setIsFriendIconDisable( true );
				break;
			default:
				break;
		}
	}, [ userRelationStatus ] );

	// * List all online users
	useEffect( () => {
		let listOnlineUsers: { login: string; status: string }[] = [];
		socket?.off( 'OnlineUsersToClient' );
		socket?.on( 'OnlineUsersToClient', function ( OnlineUsers: IOnlineUser[] ) {
			OnlineUsers.forEach( ( element ) => {
				listOnlineUsers.push( { login: element.login, status: element.status } );
			} );
			if ( !mounted.current )
				return;
			setUserStatus( listOnlineUsers );
		} );
	}, [ userConnectStatus ] );

	// * On page load => get all users online
	useEffect( () => {

		if ( !mounted.current )
			return;
		socket?.emit( 'clientRequestOnlineUsers' );
	}, [] );

	//? ACTIONS

	const getIsSentInvite = async (): Promise<boolean> => {
		const allSentRequests: IFriendInvite[] | undefined = await getSentInivtes();

		if ( login && allSentRequests )
			return allSentRequests.map( ( element ) => element.receiver ).includes( login );
		else
			return false;
	};

	const getIsReceivedInvite = async (): Promise<boolean> => {
		const allReceivedRequests: IFriendInvite[] | undefined = await getPendingInivtes();

		if ( login && allReceivedRequests )
			return allReceivedRequests.map( ( element ) => element.sender ).includes( login );
		else
			return false;
	};

	/**
	 * getUserRelation()
	 * Check if we sent an invite to him (we do it first as it is lighter for the server).
	 * Check if we received an invite from him.
	 * Then, if it is not, check if user is already a friend.
	 * Also check if user blocked login
	 */
	const getUserRelation = async () => {
		if ( !login )
			return;

		setUserRelationStatus( 'loading' );

		const isSent = await getIsSentInvite();
		const isReceived = await getIsReceivedInvite();
		const allFriends: string[] | undefined = await getFriendsLogins();
		const allBlocked: string[] | undefined = await getBlockedLogins();

		if ( authContext.login === login )
			return setUserRelationStatus( 'self' );

		// If login sent an invite to user
		if ( isReceived )
			setUserRelationStatus( 'invite received' );
		// If we sent an invite to login
		else if ( isSent )
			setUserRelationStatus( 'invite sent' );
		// If we are friends with login
		else if ( allFriends && allFriends.includes( login ) )
			setUserRelationStatus( 'friends' );
		else
			setUserRelationStatus( 'none' );

		// If we block user
		if ( allBlocked && allBlocked.includes( login ) )
			setIsUserBlocked( true );
		else
			setIsUserBlocked( false );
	};

	const handleInviteClick = async () => {
		if ( login ) {
			setUserRelationStatus( 'loading' );
			const response = await postFriendInvite( login );
			if ( response === 201 )
				getUserRelation();
			else
				notifContext.postNotif( { type: 'error', title: 'Erreur', content: 'Invitation échouée, veuillez réessayer.' } );
		}
	};

	const handleDenyClick = async () => {
		if ( login ) {
			setUserRelationStatus( 'loading' );
			const response = await postFriendDeny( login );
			if ( response === 201 )
				getUserRelation();
			else
				notifContext.postNotif( { type: 'error', title: 'Erreur', content: 'Action échouée, veuillez réessayer.' } );
		}
	};

	const handleAcceptClick = async () => {
		if ( login ) {
			setUserRelationStatus( 'loading' );
			const response = await postFriendAccept( login );
			if ( response === 201 )
				getUserRelation();
			else
				notifContext.postNotif( { type: 'error', title: 'Erreur', content: 'Action échouée, veuillez réessayer.' } );
		}
	};

	const handleBlockClick = async () => {
		if ( login ) {
			setBlockIconCorner( SEMANTIC_ICON_LOADING );
			const response = await postBlock( login );
			if ( response === 201 )
				getUserRelation();
			else
				notifContext.postNotif( { type: 'error', title: 'Erreur', content: 'Action échouée, veuillez réessayer.' } );
		}
	};

	const handleUnblockClick = async () => {
		if ( login ) {
			setBlockIconCorner( SEMANTIC_ICON_LOADING );
			const response = await postUnblock( login );
			if ( response === 201 )
				getUserRelation();
			else
				notifContext.postNotif( { type: 'error', title: 'Erreur', content: 'Action échouée, veuillez réessayer.' } );
		}
	};

	const handleOpenHistoryMatch = async () => {
		setOpenMatchHistory( true );
		if ( login ) {
			const getHistoryGames = await getGameHistoryByLogin( login );
			if ( !mounted.current )
				return;
			setGameHistory( getHistoryGames );
		}
	};

	//? CONTENT

	function GameHistoryItem( props: IGameHistory ): JSX.Element {
		return (
			<Segment>
				<Grid textAlign="center" verticalAlign="middle" columns={5}>
					<Grid.Column>{timeStampToString( new Date( props.timeStamp ) )}</Grid.Column>
					<Grid.Column>{props.winnerLogin}</Grid.Column>
					<Grid.Column>{props.winnerScore}</Grid.Column>
					<Grid.Column>{props.looserLogin}</Grid.Column>
					<Grid.Column>{props.looserScore}</Grid.Column>
				</Grid>
			</Segment>
		);
	}

	function GameHistoryList( props: any ): JSX.Element {
		return (
			<div>
				<Segment>
					<Grid textAlign="center" verticalAlign="middle" columns={5}>
						<Grid.Column>
							<Header> Date </Header>
						</Grid.Column>
						<Grid.Column>
							<Header> Login gagnant </Header>
						</Grid.Column>
						<Grid.Column>
							<Header> Score gagnant </Header>
						</Grid.Column>
						<Grid.Column>
							<Header> Login perdant </Header>
						</Grid.Column>
						<Grid.Column>
							<Header> Score perdant </Header>
						</Grid.Column>
					</Grid>

				</Segment>
				{gameHistory && gameHistory.map( ( props: IGameHistory, index: number ) =>
					<GameHistoryItem key={index}
						winnerLogin={props.winnerLogin}
						looserLogin={props.looserLogin}
						winnerScore={props.winnerScore}
						looserScore={props.looserScore}
						timeStamp={props.timeStamp}
					/>
				)}
			</div>
		);
	}

	//? RENDER

	return (
		<Containers.Page>
			<Modal onClose={() => setOpenMatchHistory( false )} onOpen={() => setOpenMatchHistory( true )} open={openMatchHistory}>
				<Modal.Header>Historique des matchs de Pong</Modal.Header>
				<Modal.Content>
					{/* <Modal.Description>
                    </Modal.Description> */}
					<GameHistoryList />
				</Modal.Content>
				<Modal.Actions>
					<Button basic color="red" onClick={() => setOpenMatchHistory( false )}>
						Fermer
					</Button>
				</Modal.Actions>
			</Modal>
			{!userPublic ? (
				// User is loading
				!isUserNotFound ? (
					<ScreenTransitions.Loading />
				) : (
					// User is not found
					<>
						<Buttons.ReturnLink href={APP_USER_SEARCH_PATH} />
						<Containers.Centered>
							<LoginMessage status={ELoginStatus.UserNotFound} />
						</Containers.Centered>
					</>
				)
			) : (
				// User is found
				<>
					<Text.PageSubtitle className="forest">Ce grand chef que voici</Text.PageSubtitle>
					<br />
					<br />
					<br />
					<Grid>
						{/* RETURN BUTTON */}
						<Grid.Column width={12}>
							{
								location.hash === '#leaderboard' ? (
									<Buttons.ReturnLink href={APP_LEADERBOARD_PATH} />
								) : location.hash === '#friends' || location.hash === '#pending' || location.hash === '#invites' ? (
									<Buttons.ReturnLink href={APP_PROFILE_PATH + location.hash} />
								) : location.hash === '#jouer' ? (
									<Buttons.ReturnLink href={APP_PLAY_PATH} />
								) : (
									<Buttons.ReturnLink href={APP_USER_SEARCH_PATH} />
								)
							}
						</Grid.Column>
						<Grid.Column>
							<Table basic='very'>
								<tbody>
									<tr>
										{displayUserStatus( userPublic.login, userConnectStatus )}
									</tr>
								</tbody>
							</Table>
						</Grid.Column>
						{/* MATCH HISTORY */}
						<Grid.Column width={1}>
							<Popup wide
								position="top center"
								content="Afficher l'historique des matchs"
								trigger={
									<img src={coupleFight} className='pointer' alt="couple fight" width="29px" onClick={handleOpenHistoryMatch} />
								}
							/>
						</Grid.Column>
						{/* IF USER LOOKS AT IT'S OWN PROFILE */}
						{authContext.login !== userPublic.login ? (
							<>
								{/* FRIENDSHIP ACTIONS */}
								{!isUserBlocked ? (
									<Grid.Column width={1}>
										{userRelationStatus === 'invite received' ? (
											// Handle received invite
											<Popup
												wide
												position="top center"
												trigger={
													<Icon.Group
														size="big"
														className={!isFriendIconDisable ? 'pointer' : ''}
														disabled={isFriendIconDisable}
														onMouseEnter={() => setIsHoverFriendIcon( true )}
														onMouseLeave={() => setIsHoverFriendIcon( false )}
													>
														<Icon name={friendIcon} />
														{isHoverFriendIcon ? <Icon corner="top right" name="question" /> : <></>}
													</Icon.Group>
												}
												on="click"
											>
												<Grid divided columns="equal">
													<Grid.Column>
														<Button color="red" content="Refuser :o" fluid onClick={() => handleDenyClick()} />
													</Grid.Column>
													<Grid.Column>
														<Button color="blue" content="Accepter !" fluid onClick={() => handleAcceptClick()} />
													</Grid.Column>
												</Grid>
											</Popup>
										) : (
											// Handle all others
											<Popup
												position="top center"
												size="tiny"
												trigger={
													<Icon
														size="big"
														className={!isFriendIconDisable ? 'pointer' : ''}
														loading={userRelationStatus === 'loading'}
														name={isHoverFriendIcon && onHoverFriendIcon ? onHoverFriendIcon : friendIcon}
														disabled={isFriendIconDisable}
														onClick={() => {
															if ( userRelationStatus === 'none' )
																handleInviteClick();
															else if ( userRelationStatus === 'friends' || userRelationStatus === 'invite sent' )
																handleDenyClick();
														}}
														onMouseEnter={() => setIsHoverFriendIcon( true )}
														onMouseLeave={() => setIsHoverFriendIcon( false )}
													/>
												}
												content={friendIconPopup}
											/>
										)}
									</Grid.Column>
								) : (
									<Grid.Column width={1} />
								)}
								{/* CHAT WITH USER */}
								{/* <Grid.Column width={1}>
									<Popup position="top center" size="tiny" trigger={<Icon name="paper plane" size="big" disabled />} content={'Disctuter avec ' + userPublic.name} />
								</Grid.Column> */}
								{/* BLOCK USER */}
								<Grid.Column width={1}>
									<Popup
										position="top right"
										size="tiny"
										trigger={
											<Icon.Group
												size="big"
												className="pointer"
												onMouseEnter={() => setIsHoverBlockIcon( true )}
												onMouseLeave={() => setIsHoverBlockIcon( false )}
												onClick={isUserBlocked ? () => handleUnblockClick() : () => handleBlockClick()}
											>
												<Icon name="shield alternate" color={isUserBlocked ? 'red' : 'black'} />
												{isHoverBlockIcon ? <Icon corner="top right" name="times" /> : <></>}
											</Icon.Group>
										}
										content={!isUserBlocked ? 'Bloquer ' + userPublic.name : 'Débloquer ' + userPublic.name}
									/>
								</Grid.Column>
							</>
						) : (
							<></>
						)}
					</Grid>
					<ProfileCard
						size="big"
						userData={userPublic}
						message={isUserBlocked ? 'Vous avez bloqué ' + userPublic.name : relationMessage}
						strongMessage={userRelationStatus === 'invite received' || isUserBlocked}
					/>
				</>
			)}
		</Containers.Page>
	);
}
