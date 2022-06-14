import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon, Label, Menu, Modal, Popup } from 'semantic-ui-react';
import Lists from '../../../components/lists';
import { APP_PROFILE_PATH, APP_USER_SEARCH_PATH, SEMANTIC_ICON_LOADING } from '../../../globals/constants';

import './FriendsModal.css';
import { IUsersPublic } from '../../../interfaces/usersPublicInterface';
import { getFriends, getPendingInivtes, getSentInivtes } from '../../../requests/friendsRequests';
import { getUserPublic } from '../../../requests/usersRequests';

interface IFriendsProps {
	userLogin: string;
}

type TFriendsTabName = 'friends' | 'pending' | 'invites';

export function FriendsModal( props: IFriendsProps ): JSX.Element {
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
	const [ userFriends, setUserFriends ] = useState<IUsersPublic[] | undefined>( undefined );
	const [ userPending, setUserPending ] = useState<IUsersPublic[] | undefined>( undefined );
	const [ userSent, setUserSent ] = useState<IUsersPublic[] | undefined>( undefined );
	const [ isLists, setIsLists ] = useState<boolean>( false );
	const [ activeUsersList, setActiveUsersList ] = useState<IUsersPublic[] | undefined>( undefined );
	// Navigation
	const hash = useLocation().hash;
	const navigate = useNavigate();

	//* On location change
	// Set active users according to location
	useEffect( () => {
		if ( isLists )
			getActiveUsersList( hash.substring( 1 ) );
	}, [ hash ] );

	//* On users list change
	// Update activeUsers list
	useEffect( () => {
		if ( userFriends && userPending && userSent ) {
			setIsLists( true );
			getActiveUsersList( hash.substring( 1 ) );
		}
	}, [ userFriends, userPending, userSent ] );

	//* On all lists change
	// Set activeUsers
	useEffect( () => {
		if ( isLists )
			getActiveUsersList( hash.substring( 1 ) );
	}, [ isLists ] );

	//* On mount
	// Get lists
	useEffect( () => {
		getAllLists();
	}, [] );

	//? ACTIONS

	const tabs: TFriendsTabName[] = [ 'friends', 'pending', 'invites' ];

	const getAllLists = async () => {
		// Reset
		// setIsLists( false );
		setUserFriends( undefined );
		setUserPending( undefined );
		setUserSent( undefined );
		// Friends
		const friends = await getFriends();
		let friendsUser: IUsersPublic[] = [];
		if ( friends )
			friendsUser = [ ...friends ];
		// Pending
		const pending = await getPendingInivtes();
		let pendingUsers: IUsersPublic[] = [];
		if ( pending ) {
			for ( const element of pending ) {
				const profile = await getUserPublic( element.sender );

				if ( profile )
					pendingUsers.push( profile );
			}
		}
		// Sent
		const sent = await getSentInivtes();
		let sentUsers: IUsersPublic[] = [];
		if ( sent ) {
			for ( const element of sent ) {
				const profile = await getUserPublic( element.receiver );

				if ( profile )
					sentUsers.push( profile );
			}
		}

		if ( !mounted.current )
			return;
		setUserPending( pendingUsers );
		setUserSent( sentUsers );
		setUserFriends( friendsUser );
	};

	/**
	 * getActiveUsersList()
	 * Set the users list according to @param tab
	 */
	const getActiveUsersList = ( tab: string ) => {
		if ( !isLists )
			return;

		switch ( tab ) {
			case 'friends':
				setActiveUsersList( userFriends );
				break;
			case 'pending':
				setActiveUsersList( userPending );
				break;
			case 'invites':
				setActiveUsersList( userSent );
				break;
			default:
				setActiveUsersList( undefined );
				break;
		}
	};

	/**
	 * handleOpenClick()
	 * If user has notifications, opens on the notifications, else open on friends.
	 */
	const handleOpenClick = () => {
		if ( userPending && userPending.length )
			navigate( APP_PROFILE_PATH + '#pending' );
		else
			navigate( APP_PROFILE_PATH + '#friends' );
	};

	//? RENDER

	return (
		<Modal
			onClose={() => navigate( APP_PROFILE_PATH )}
			open={hash === '#friends' || hash === '#pending' || hash === '#invites'}
			trigger={
				<Popup
					position="top center"
					size="tiny"
					trigger={
						<Icon.Group className="pointer" onClick={() => handleOpenClick()}>
							<Icon name="users" size="big" aria-label="red	" />
							{
								// Pending invites notifications
								userPending && userPending.length !== 0 ? (
									<Label circular color="red" floating size="tiny" style={{ zIndex: 1 }}>
										{userPending.length}
									</Label>
								) : (
									<></>
								)
							}
						</Icon.Group>
					}
					content="Amis"
				/>
			}
			className="friend-modal"
		>
			{/* MENU */}
			<Menu pointing secondary>
				{tabs.map( ( tabName: TFriendsTabName, index ) => (
					<Menu.Item
						name={
							tabName === 'friends'
								? 'Mes amis ' + ( userFriends ? userFriends.length : '' )
								: tabName === 'pending'
									? 'Demandes recues ' + ( userPending ? userPending.length : '' )
									: tabName === 'invites'
										? 'Demandes envoyées ' + ( userSent ? userSent.length : '' )
										: ''
						}
						active={hash.substring( 1 ) === tabName}
						onClick={() => navigate( APP_PROFILE_PATH + '#' + tabName )}
						key={index}
					/>
				) )}
				<Menu.Menu position="right">
					<Menu.Item disabled>
						{
							// users list loader
							!userFriends || !userPending || !userSent ? <Icon name={SEMANTIC_ICON_LOADING} loading /> : <Icon name="check" />
						}
					</Menu.Item>
				</Menu.Menu>
			</Menu>
			{/* CONTENT */}
			<Lists.Users className="list">
				{!activeUsersList || !isLists ? (
					<></>
				) : (
					activeUsersList.map( ( element: IUsersPublic, index ) => (
						<Lists.User
							userSearchPath={APP_USER_SEARCH_PATH}
							login={element.login}
							name={element.name}
							avatarUrl={element.avatarUrl}
							userSearchHash={hash}
							// Actions on user
							onButtonClick={getAllLists}
							// Deny
							denyButton
							denyPopup={hash === '#friends' ? 'Retirer' : hash === '#pending' ? 'Refuser' : hash === '#invites' ? 'Annuler' : ''}
							// Accept
							acceptButton={hash === '#pending'}
							acceptPopup="Accepter"
							key={index}
						/>
					) )
				)}
			</Lists.Users>
		</Modal>
	);
}
