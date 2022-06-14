import { API_URL } from '../globals/constants';
import { axiosJsonBearer } from './axios';

/**
 * getFriendsLogins()
 * @returns an array of all user's friend's login
 */
export async function getBlockedLogins(): Promise<string[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/blocks/logins', 'GET' );
		const friends: string[] | undefined = await response.data;
		if ( response.status === 200 ) {
			return friends;
		} else {
			return undefined;
		}
	} catch ( err ) {
		return undefined;
	}
}

/**
 * postFriendAccept()
 * @param to user's login to accept invite
 */
export async function postBlock( to: string ): Promise<number> {
	try {
		const response = await axiosJsonBearer( API_URL + '/blocks/block?to=' + to, 'POST' );
		return response.status;
	} catch ( err ) {
		return 0;
	}
}

/**
 * postUnblock()
 * @param to user's login to unblock
 */
export async function postUnblock( to: string ): Promise<number> {
	try {
		const response = await axiosJsonBearer( API_URL + '/blocks/unblock?to=' + to, 'POST' );
		return response.status;
	} catch ( err ) {
		return 0;
	}
}
