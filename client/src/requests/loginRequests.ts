import axios from 'axios';
import { API_URL } from '../globals/constants';
import { ILoginSuccess } from '../interfaces/loginSuccessInterface';
import { IRefreshedToken } from '../interfaces/refreshedTokenInterface';
import { axiosJsonBearer } from './axios';

export async function getRefreshedToken(): Promise<IRefreshedToken | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/auth/refresh_token', 'GET' );
		const refreshedToken: IRefreshedToken = response.data;
		if ( response.status === 200 )
			return refreshedToken;
		else
			return undefined;
	} catch ( err ) {
		return undefined;
	}
}

/**
 * getAccessToken()
 * @param code authorization code provided by 42 OAuth login
 * @returns a loginSuccess dto ex: {
		login: string,
		userCreation: boolean,
		apiToken: string,
		ftRefreshToken: string,
	}
 */
export async function getAccessToken( code: string ): Promise<ILoginSuccess | undefined> {
	try {
		const response = await axios( {
			method: 'GET',
			url: API_URL + '/auth/get_token?code=' + code,
		} );
		const loginSuccess: ILoginSuccess = response.data;
		if ( response.status === 200 )
			return loginSuccess;
		else
			return undefined;
	} catch ( err ) {
		return undefined;
	}
}

/**
 * getGuestAccessToken()
 */
export async function getGuestAccessToken(): Promise<ILoginSuccess | undefined> {
	try {
		const response = await axios( {
			method: 'GET',
			url: API_URL + '/auth/guest/get_token',
		} );
		const loginSuccess: ILoginSuccess = response.data;
		if ( response.status === 200 )
			return loginSuccess;
		else
			return undefined;
	} catch ( err ) {
		return undefined;
	}
}

/**
 * sendTwoFaCode()
 * Sends the two fa code and returns loginSuccess if ok, undefined otherwise
 */
export async function sendTwoFaCode( login: string, code: string ): Promise<ILoginSuccess | undefined> {
	try {
		const response = await axios( {
			method: 'GET',
			url: API_URL + '/auth/twofa/get_token?login=' + login + '&code=' + code,
		} );
		const loginSuccess: ILoginSuccess = response.data;
		if ( response.status === 200 )
			return loginSuccess;
		else
			return undefined;
	} catch ( err ) {
		return undefined;
	}
}
