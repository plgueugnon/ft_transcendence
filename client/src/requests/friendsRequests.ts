import { API_URL } from '../globals/constants';
import { IFriendInvite } from '../interfaces/friendInviteInterface';
import { IUsersPublic } from '../interfaces/usersPublicInterface';
import { axiosJsonBearer } from './axios';

//? POSTERS

/**
 * postFriendDeny()
 * @param to user's login to deny invite
 */
export async function postFriendDeny( to: string ): Promise<number> {
	try {
		const response = await axiosJsonBearer( API_URL + '/friends/deny?to=' + to, 'POST' );
		return response.status;
	} catch ( err ) {
		return 0;
	}
}

/**
 * postFriendAccept()
 * @param to user's login to accept invite
 */
export async function postFriendAccept( to: string ): Promise<number> {
	try {
		const response = await axiosJsonBearer( API_URL + '/friends/accept?to=' + to, 'POST' );
		return response.status;
	} catch ( err ) {
		return 0;
	}
}

/**
 * postFriendInvite()
 * @param to user's login to invite
 */
export async function postFriendInvite( to: string ): Promise<number> {
	try {
		const response = await axiosJsonBearer( API_URL + '/friends/invite?to=' + to, 'POST' );
		return response.status;
	} catch ( err ) {
		return 0;
	}
}

//? GETTERS

/**
 * getFriendsLogins()
 * @returns an array of all user's friend's login
 */
export async function getFriendsLogins(): Promise<string[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/friends/logins', 'GET' );
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
 * getFriends()
 * @returns an array of all our friend's PublicProfile
 */
export async function getFriends(): Promise<IUsersPublic[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/friends', 'GET' );
		const friends: IUsersPublic[] | undefined = await response.data;
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
 * getSentInivtes()
 */
export async function getSentInivtes(): Promise<IFriendInvite[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/friends/sent', 'GET' );
		const friendInvites: IFriendInvite[] | undefined = await response.data;
		if ( response.status === 200 ) {
			return friendInvites;
		} else {
			return undefined;
		}
	} catch ( err ) {
		return undefined;
	}
}

/**
 * getPendingInivtes()
 */
export async function getPendingInivtes(): Promise<IFriendInvite[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/friends/pending', 'GET' );
		const friendInvites: IFriendInvite[] | undefined = await response.data;
		if ( response.status === 200 ) {
			return friendInvites;
		} else {
			return undefined;
		}
	} catch ( err ) {
		return undefined;
	}
}
