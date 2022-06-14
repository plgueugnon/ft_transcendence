import axios from 'axios';
import { API_URL } from '../globals/constants';
import { INewMessage } from '../pages/chat/interfaces/newMessage';
import { axiosJsonBearer } from './axios';
// import {IUsersPublic} from '../interfaces/usersPublicInterface'
// TODO import Interface channelInfos
// TODO nest setting to handle channel request

// * fetch request on API at localhost:5050/chat/channels/
export async function getMessages(): Promise<[] | undefined> {
	try {
		const response = await axios( API_URL + '/chat/messages' );
		return await response.data;
	} catch ( error ) {
		return undefined;
	}
}

export async function getMessagesByChannel( channelId: number ): Promise<INewMessage[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/messages/' + channelId.toString(), 'GET' );
		return await response.data;
	} catch ( error ) {
		return undefined;
	}
}

export async function postNewMessage( newMessageData: INewMessage ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/chat/messages', 'POST', newMessageData );
		return response.status;
	} catch ( err ) {
		return 0;
	}
}
