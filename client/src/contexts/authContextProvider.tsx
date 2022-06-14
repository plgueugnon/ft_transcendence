import { useContext, useEffect, useState } from 'react';

import { APP_COOKIE_NAME, APP_ERROR_PATH, APP_TMP_COOKIE_NAME, APP_USER_CREATION_PATH, APP_USER_CREATION_URL } from '../globals/constants';
import { IRefreshedToken } from '../interfaces/refreshedTokenInterface';
import { IUserProfile } from '../interfaces/userProfileInterface';
import { getRefreshedToken } from '../requests/loginRequests';
import { getUserProfile } from '../requests/profileRequests';
import { AuthContext } from './authContext';
import { TJsxChildren } from '../globals/types';
import { sleep } from '../globals/utils';
import { useNavigate } from 'react-router-dom';

import { Socket } from 'socket.io-client';
import { SocketContext } from './socketContext';
import { IOnlineUser } from '../interfaces/userOnlineStatusInterface';

interface IAuthContextProps {
	setIsAppLoaded: ( isAppLoaded: boolean ) => void;
	children?: TJsxChildren;
}

interface IAppCookie {
	token: string;
	login: string;
	expirationDate: string;
}

export function AuthContextProvider( props: IAuthContextProps ): JSX.Element {
	//? HOOKS
	// Data
	const [ token, setToken ] = useState<string>( '' );
	const [ login, setLogin ] = useState<string>( '' );
	const [ username, setUsername ] = useState<string>( '' );
	const [ avatarUrl, setAvatarUrl ] = useState<string>( '' );
	// While user creation isn't done, avatarUrl will be '' and app will automaticly redirect to profile userCreation
	const [ tokenExpirationDate, setTokenExpirationDate ] = useState<Date | undefined>( undefined );
	const [ expirationTimeout, setExiprationTimeout ] = useState<any>( undefined );
	// socket
	const [ value, initSocket ] = useState<Socket>();
	const socket = useContext( SocketContext );
	// React
	const navigate = useNavigate();

	// * create only one socket upon arrival on landing page
	// * socket will be set "open" only upon successful auth later on
	useEffect( () => {
		initSocket( socket );
	}, [ socket ] );

	//* On token change
	// Start revoke countdown
	useEffect( () => {
		// Timeout logout token (5 minutes before expiration)
		if ( tokenExpirationDate ) {
			const timeout = setTimeout( doLogout, new Date( tokenExpirationDate ).getTime() - 1000 * 60 * 5 - new Date().getTime() );
			if ( expirationTimeout )
				clearTimeout( expirationTimeout );
			setExiprationTimeout( timeout );
		}
	}, [ tokenExpirationDate ] );

	//? AUTHENTIFICATION FUNCTIONS

	const doRefreshToken = async () => {
		const response: IRefreshedToken | undefined = await getRefreshedToken();

		if ( response )
			doLogin( response.freshToken, login, new Date( response.expirationDate ) );
		else
			navigate( APP_ERROR_PATH );
	};

	// * socket notification upon new user connection
	async function waitUntilSocketConnect( login: string ) {

		while ( socket?.id === undefined ) await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );
		let OnlineNewUser: IOnlineUser = { login: login, socketID: JSON.parse( JSON.stringify( socket?.id ) ), status: 'online' };
		socket?.emit( 'newUserFromClient', OnlineNewUser );
	}

	/**
	 * doLogin()
	 * @param token
	 * @param login
	 * @param expirationDate
	 * Perform login
	 */
	const doLogin = async ( token: string, login: string, expirationDate: Date, onLoginRedirect?: string ) => {
		// Set auth data
		setToken( token );
		setLogin( login );
		const expiration = expirationDate || new Date( new Date().getTime() + 1000 * 60 * 60 );
		setTokenExpirationDate( expiration );

		// Erase tmp storage
		if ( localStorage.getItem( APP_TMP_COOKIE_NAME ) )
			localStorage.removeItem( APP_TMP_COOKIE_NAME );

		// Store some data in local storage
		const cookie: IAppCookie = {
			token: token,
			login: login,
			expirationDate: expiration.toISOString(),
		};
		localStorage.setItem( APP_COOKIE_NAME, JSON.stringify( cookie ) );

		// Get profile to check avatarUrl and userCreation
		const userProfile: IUserProfile | undefined = await getUserProfile( login );
		// If api call failed
		if ( !userProfile ) {
			await sleep( 500 );
			doLogout();
			window.location.replace( APP_ERROR_PATH );
		}
		// If user creation is not over redirect to user creation
		else if ( window.location.href !== APP_USER_CREATION_URL && userProfile && !userProfile.isUserCreated ) {
			navigate( APP_USER_CREATION_PATH );
		}
		// Else, user is created and we can set avatarUrl
		else {
			setUsername( userProfile.name );
			setAvatarUrl( userProfile.avatarUrl );
			if ( onLoginRedirect )
				navigate( onLoginRedirect );
		}
		sleep( 100 ).then( () => props.setIsAppLoaded( true ) );

		// * login is successful and we can connect user socket
		socket?.connect();
		waitUntilSocketConnect( login );
	};

	/**
	 * doLogout()
	 * Logout the user and redirect to /
	 * disconnect user socket
	 */
	const doLogout = () => {
		localStorage.removeItem( APP_COOKIE_NAME );
		localStorage.removeItem( APP_TMP_COOKIE_NAME );
		window.location.replace( '/' );
		socket?.disconnect();
	};

	/**
	 * reload()
	 * Redo the login process (used for updates and synchronisations)
	 */
	const reload = async () => {
		const storedItem = localStorage.getItem( APP_COOKIE_NAME );
		if ( !storedItem )
			return;

		const storedData: IAppCookie = JSON.parse( storedItem );
		if ( storedData && storedData.token && storedData.login && new Date( storedData.expirationDate ) > new Date() )
			doLogin( storedData.token, storedData.login, new Date( storedData.expirationDate ) );
	};

	//* On mount -> page load
	useEffect( () => {
		props.setIsAppLoaded( false );

		const storedItem = localStorage.getItem( APP_COOKIE_NAME );
		// If no cookie
		if ( !storedItem ) {
			props.setIsAppLoaded( true );
			return;
		}

		// If cookie
		const storedData: IAppCookie = JSON.parse( storedItem );
		if ( storedData && storedData.token && storedData.login && new Date( storedData.expirationDate ) > new Date() )
			doLogin( storedData.token, storedData.login, new Date( storedData.expirationDate ) );
		else {
			doLogout();
			props.setIsAppLoaded( true );
		}
	}, [] );

	//? RENDER
	return (
		<AuthContext.Provider
			value={{
				isLoggedIn: token !== '',
				isUserCreated: avatarUrl !== '' && avatarUrl !== 'custom',
				login: login,
				username: username,
				avatarUrl: avatarUrl,
				tokenExpirationDate: tokenExpirationDate,
				doLogin: doLogin,
				doLogout: doLogout,
				doRefreshToken: doRefreshToken,
				reload: reload,
			}}
		>
			<SocketContext.Provider value={value}>{props.children}</SocketContext.Provider>
		</AuthContext.Provider>
	);
}
