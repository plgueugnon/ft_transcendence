import { Container, Menu } from 'semantic-ui-react';
import { useLocation, useNavigate } from 'react-router-dom';

import './HeaderMenu.css';
import { IMenuItem } from '../globals/types';
import { useContext, useEffect, useRef, useState } from 'react';
import MenuItem from '../components/menuItems';
import ft_logo from '../images/logo-42.png';
import { windowOAuthPopup } from '../requests/windowRequests';
import { AuthContext } from '../contexts/authContext';
import { rand, sleep } from '../globals/utils';
import { APP_2FA_PATH, APP_CUSTOM_UPLOAD_NAME, APP_LOGIN_REDIRECT_PATH, APP_PROFILE_PATH, APP_USER_CREATION_QUERY, APP_USER_SEARCH_PATH } from '../globals/constants';
import { useKeyPress } from '../hooks/useKeyPress';
import { getPendingInivtes } from '../requests/friendsRequests';
import { IFriendInvite } from '../interfaces/friendInviteInterface';
import { ILoginSuccess } from '../interfaces/loginSuccessInterface';
import { getGuestAccessToken } from '../requests/loginRequests';
import { NotifContext } from '../contexts/notifContext';
import { SocketContext } from '../contexts/socketContext';
import { RouteTrackerContext } from '../contexts/routeTrackerContext';

interface MenuProps {
	activePage?: string;
}

const menuItems: IMenuItem[] = [
	{ name: 'Jouer', path: '/jouer', icon: 'gamepad' },
	{ name: 'Salons', path: '/salons', icon: 'chat' },
];

/*
 * HeaderMenu
 * Main menu of the website
 */
export function HeaderMenu( props: MenuProps ): JSX.Element {
	//? HOOKS
	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );
	// Auth
	const [ isLoggingLoading, setisLoggingLoading ] = useState<boolean>( false );
	const [ isGuestLoading, setisGuestLoading ] = useState<boolean>( false );
	const [ authorizationQuery, setAuthorizationQuery ] = useState<string>( '' );
	// Navigation
	const [ activePathname, setActivePathname ] = useState<string>( '' );
	const [ activeQuery, setActiveQuery ] = useState<string>( '' );
	const location = useLocation();
	const navigate = useNavigate();
	const previous = usePrevious( location.pathname );
	// Contexts
	const authContext = useContext( AuthContext );
	const notifContext = useContext( NotifContext );
	const socket = useContext( SocketContext );
	const routeTracker = useContext( RouteTrackerContext );
	// Keyboard
	const enterPress = useKeyPress( 'Enter' );
	const escapePress = useKeyPress( 'Escape' );
	// Data
	const [ isSearchActive, setIsSearchActive ] = useState<boolean>( false );
	const [ usersSearch, setUsersSearch ] = useState<string>( '' );
	const [ pendingFriendsRequests, setPendingFriendsRequests ] = useState<IFriendInvite[]>( [] );

	//* On mount
	// Handle notifications
	// useEffect( () => {
	// 	// Send popups for friend pending invites
	// 	for ( const request of pendingFriendsRequests )
	// 	{
	// 		notifContext.postNotif( { type: 'info',
	// 			title: 'Nouvelle invitation',
	// 			content: request.sender + ' vous a invité à rejoindre ses amis !',
	// 		} );
	// 	}
	// }, [ pendingFriendsRequests ] );

	function usePrevious( value: any ) {
		const ref = useRef();
		useEffect( () => {
			ref.current = value;
		} );
		return ref.current;
	}

	//* On OAuth login redirect
	// Redirect to authorizationQuery (received when accessing to login endpoint from popup)
	useEffect( () => {
		if ( authorizationQuery.substring( 0, APP_LOGIN_REDIRECT_PATH.length ) === APP_LOGIN_REDIRECT_PATH )
			navigate( authorizationQuery );
	}, [ authorizationQuery ] );

	//* On location change
	useEffect( () => {
		// Change path and query for menu dynamic render
		setActivePathname( location.pathname );
		setActiveQuery( location.search );

		// ! tracks path modification and forces game exit if user was in a game when he changed route
		if ( previous === '/jouer' && location.pathname !== '/jouer' && routeTracker.gameID !== '' ) {
			socket?.emit( 'leaveGame', [ routeTracker.gameID, authContext.login ] );
			routeTracker.setGameID( '' );
		}

		// Get new friend invites
		// TODO Socketize ?
		if ( authContext.isLoggedIn && authContext.isUserCreated ) {
			getPendingInivtes().then( ( response: IFriendInvite[] | undefined ) => {
				if ( !mounted.current ) return;
				// Notif value
				if ( response )
					setPendingFriendsRequests( response );
			} );
		}

		// Refresh the token if necessary (if currently logged and if token expires in < than 30minutes)
		if ( authContext.tokenExpirationDate && authContext.tokenExpirationDate.getTime() < new Date().getTime() + 1000 * 60 * 30 )
			authContext.doRefreshToken();

		// Check wether or not search bar must be active
		if ( location.pathname === APP_USER_SEARCH_PATH )
			setIsSearchActive( true );
		else
			setIsSearchActive( false );
	}, [ location ] );

	//* On Enter press
	// If searchbar is active, click on search
	useEffect( () => {
		if ( enterPress && isSearchActive )
			handleUsersSearchClick();
	}, [ enterPress ] );

	//* On Escape press
	// If searchbar is active, deactive
	useEffect( () => {
		if ( escapePress && isSearchActive )
			setIsSearchActive( false );
	}, [ escapePress ] );

	//* On usersSearch change
	// If page is user, live render result by clicking on search
	useEffect( () => {
		if ( location.pathname === APP_USER_SEARCH_PATH )
			handleUsersSearchClick();
	}, [ usersSearch ] );

	//? ACTIONS

	const handleGuestLoginClick = async () => {
		setisGuestLoading( true );
		const loginSuccess: ILoginSuccess | undefined = await getGuestAccessToken();
		if ( !mounted.current )
			return;

		if ( loginSuccess )
			authContext.doLogin( loginSuccess.apiToken, loginSuccess.login, new Date( loginSuccess.expirationDate ), APP_PROFILE_PATH );
	};

	const handleLoginClick = () => {
		setisLoggingLoading( true );
		windowOAuthPopup(
			( query: string ) => setAuthorizationQuery( query ),
			() => setisLoggingLoading( false )
		);
	};

	const handleLogoutClick = () => {
		setisLoggingLoading( true );
		sleep( rand( 500, 900 ) ).then( () => {
			authContext.doLogout();
			setisLoggingLoading( false );
		} );
	};

	const handleUsersSearchClick = () => {
		navigate( APP_USER_SEARCH_PATH + '?search=' + usersSearch );
	};

	//? RENDER

	return (
		<div className="menu-main">
			<div className="menu-background"></div>

			<Menu secondary fixed="top" size="huge">
				<Container>
					{authContext.isUserCreated ? ( //? Because if it's '', means user creation is not complete
						<MenuItem.TitleLink url="/" active={props.activePage === 'Home'}>
							Salmong
						</MenuItem.TitleLink>
					) : (
						<MenuItem.TitleHref url="/" active={props.activePage === 'Home'}>
							Salmong
						</MenuItem.TitleHref>
					)}
					{authContext.isLoggedIn ? (
						//* LOGGED
						//* Show all bar
						activeQuery !== APP_USER_CREATION_QUERY && location.pathname !== APP_2FA_PATH ? (
							<>
								{/* LEFT MENU */}
								<Menu.Menu position="left">
									{menuItems.map( ( item ) => (
										<MenuItem.Basic
											url={item.path}
											name={item.name ? item.name : ''}
											key={item.path}
											active={activePathname.substring( 0, item.path.length ) === item.path}
											iconName={item.icon}
										/>
									) )}
								</Menu.Menu>
								<Menu.Menu position="right">
									<>
										{/* SEARCH */}
										<MenuItem.SearchButton
											placeholder="Joueurs..."
											value={usersSearch}
											setValue={setUsersSearch}
											onClick={handleUsersSearchClick}
											active={isSearchActive}
											setActive={setIsSearchActive}
										/>
										{/* LEARDERBOARD */}
										<MenuItem.IconItem url="/leaderboard" iconName="trophy" active={activePathname === '/leaderboard'} />
										{/* CHAT */}
										<MenuItem.IconItem url="/chat" iconName="paper plane" active={activePathname === '/chat'} />

										{/* PROFILE */}
										<MenuItem.Avatar
											url="/profile"
											active={activePathname === '/profile'}
											name={authContext.login}
											avatarUrl={authContext.avatarUrl !== APP_CUSTOM_UPLOAD_NAME ? authContext.avatarUrl : ''}
											notifications={pendingFriendsRequests.length}
										/>
										{/* LOGOUT */}
										<MenuItem.Button icon="sign-out" name={isLoggingLoading ? 'loading' : 'Logout'} onClick={() => handleLogoutClick()} />
									</>
								</Menu.Menu>
							</>
						) : (
							//* Show logout only
							<Menu.Menu position="right">
								<MenuItem.Button icon="sign-out" name={isLoggingLoading ? 'loading' : 'Logout'} onClick={() => handleLogoutClick()} />
							</Menu.Menu>
						)
					) : //* NOT LOGGED
						activePathname !== APP_LOGIN_REDIRECT_PATH && activePathname !== APP_2FA_PATH ? (
							//* Show login
							<Menu.Menu position="right">
								{/* DEV */}
								<MenuItem.Button name={isGuestLoading ? 'loading' : 'Se connecter en invité'} onClick={() => handleGuestLoginClick()} />
								<MenuItem.Button image={ft_logo} name={isLoggingLoading ? 'loading' : 'Se connecter'} active={props.activePage === 'Login'} onClick={() => handleLoginClick()} />
							</Menu.Menu>
						) : (
							//* Show nothing
							<></>
						)}
				</Container>
			</Menu>
		</div>
	);
}
