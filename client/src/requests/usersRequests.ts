import axios from 'axios';
import { API_URL } from '../globals/constants';
import { IGameScore } from '../interfaces/gameScore';
import { IUserProfile } from '../interfaces/userProfileInterface';
import { IUsersPublic } from '../interfaces/usersPublicInterface';
import { axiosJsonBearer } from './axios';

/**
 * getUserPublic()
 */
export async function getUserPublic( userLogin: string ): Promise<IUsersPublic | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/users/public/' + userLogin, 'GET' );
		const userProfileData: IUserProfile = await response.data;
		if ( response.status === 200 ) {
			return userProfileData;
		} else {
			return undefined;
		}
	} catch ( err ) {
		return undefined;
	}
}

// * axios request on API at localhost:5050/users
export async function getUsersInfos(): Promise<IUsersPublic[] | undefined> {
	try {
		const response = await axios.get( API_URL + '/users' );
		const usersInfo: IUsersPublic[] = response.data;
		if ( response.status === 200 ) return usersInfo;
		else return undefined;
	} catch ( err ) {
		return undefined;
	}
}

export async function postGameScore( score: IGameScore ): Promise<number> {
	try {
		const response = await axiosJsonBearer( API_URL + '/users/game', 'POST', score );
		return response.status;
	} catch ( err ) {
		return 0;
	}
}
