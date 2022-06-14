import axios from 'axios';
import { API_URL } from '../globals/constants';
import { IEditChannel } from '../pages/chat/interfaces/editChannel';
import { IEditChannelUser } from '../pages/chat/interfaces/editChannelUser';
import { axiosJsonBearer } from './axios';
import { INewChannel } from '../interfaces/newChannelInterface';
// TODO import Interface channelInfos
// TODO nest setting to handle channel request

// * fetch request on API at localhost:5050/chat/channels/
export async function getChannels(): Promise<[] | undefined> {
	try {
		const response = await axios( API_URL + '/chat/channels' );
		return await response.data;
	} catch ( error ) {
		return undefined;
	}
}

export async function isChannelProtected( channelId: number ): Promise<boolean | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/protected/' + channelId, 'GET', channelId );
		return await response.data;
	} catch ( error ) {
		return undefined;
	}
}

export async function getPrivateChannelsByLogin( login: string ): Promise<INewChannel[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/private/' + login, 'GET', login );
		return await response.data;
	} catch ( error ) {
		return undefined;
	}
}

export async function getUnjoinedPublicChannelsByLogin( login: string ): Promise<INewChannel[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/public/unjoined/' + login, 'GET', login );
		return await response.data;
	} catch ( error ) {
		return undefined;
	}
}

export async function getJoinedPublicChannelsByLogin( login: string ): Promise<INewChannel[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/public/joined/' + login, 'GET', login );
		return await response.data;
	} catch ( error ) {
		return undefined;
	}
}

export async function getUsersByChannelId( channelId: number ): Promise<[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/users/' + channelId, 'GET', channelId );
		return await response.data;
	} catch ( error ) {
		return undefined;
	}
}

// * Create a new channel with the given @channelInfos (userId, channelName, isPrivate, password)
export async function postNewChannel( newChannelData: INewChannel ): Promise<number | INewChannel> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels', 'POST', newChannelData );
		return response.data;
	} catch ( err ) {
		return 403;
	}
}

// * Mute a user in a channel with the given @muteUser (userId, channelId) for 5 minutes
export async function muteChannelUser( muteUser: IEditChannelUser ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/mute/user', 'POST', muteUser );
		return response.status;
	} catch ( e ) {
		return 403;
	}
}

// * ban a user in a channel with the given @muteUser (userId, channelId) for 5 minutes
export async function banChannelUser( banUser: IEditChannelUser ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/ban/user', 'POST', banUser );
		return response.status;
	} catch ( err ) {
		return 403;
	}
}

export async function kickChannelUser( kickUser: IEditChannelUser ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/kick/user', 'POST', kickUser );
		return response.status;
	} catch ( err ) {
		return 403;
	}
}

export async function editChannelUserRole( userRole: IEditChannelUser ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/user/role', 'POST', userRole );
		return response.status;
	} catch ( err ) {
		return 403;
	}
}

export async function editChannelPassword( channelSettings: IEditChannel ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/password', 'POST', channelSettings );
		return response.status;
	} catch ( err ) {
		return 403;
	}
}

export async function joinPublicChannel( joinChannel: IEditChannel ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/join', 'POST', joinChannel );
		return response.status;
	} catch ( err ) {
		return 403;
	}
}

export async function editChannelName( channelSettings: IEditChannel ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/name', 'POST', channelSettings );
		return response.status;
	} catch ( err ) {
		return 403;
	}
}

export async function deleteChannel( channelSettings: IEditChannel ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/delete', 'POST', channelSettings );
		return response.status;
	} catch ( err ) {
		return 403;
	}
}

export async function leaveChannel( channelSettings: IEditChannelUser ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/channels/leave', 'POST', channelSettings );
		return response.status;
	} catch ( err ) {
		return 404;
	}
}
