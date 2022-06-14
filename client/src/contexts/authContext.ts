import React from 'react';

export interface IAuthContext {
	isLoggedIn: boolean;
	isUserCreated: boolean;
	login: string;
	username: string;
	avatarUrl: string;
	tokenExpirationDate: Date | undefined;
	doLogin: Function;
	doLogout: Function;
	doRefreshToken: Function;
	reload: Function;
}

export const AuthContext = React.createContext<IAuthContext>( {
	isLoggedIn: false,
	isUserCreated: false,
	login: '',
	username: '',
	avatarUrl: '',
	tokenExpirationDate: undefined,
	doLogin: () => { },
	doLogout: () => { },
	doRefreshToken: () => { },
	reload: () => { },
} );
