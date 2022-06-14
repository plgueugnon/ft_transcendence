import { INewChannel } from '../interfaces/newChannelInterface';

import React from 'react';
import { IChannelUsers } from '../pages/chat/interfaces/channelUsers';
import { INewMessage } from '../pages/chat/interfaces/newMessage';

export interface IChatContext {
	// *channels
	channelId: number;
	channelName: string;
	channels: INewChannel[];
	rooms: INewChannel[];
	channelUsers: IChannelUsers[];
	muteTimeStamp: string | null;
	banTimeStamp: string | null;
	isPrivate: boolean;
	isBanned: boolean;
	isMuted: boolean;
	setChannelId: Function;
	setChannelName: Function;
	setChannels: Function;
	setRooms: Function;
	setChannelUsers: Function;
	setMuteTimeStamp: Function;
	setBanTimeStamp: Function;
	setIsBanned: Function;
	setIsMuted: Function;
	// *messages
	messages: INewMessage[];
	setMessages: Function;
}

export const ChatContext = React.createContext<IChatContext>( {
	channelId: 0,
	channelName: '',
	channels: [],
	rooms: [],
	channelUsers: [],
	muteTimeStamp: null,
	banTimeStamp: null,
	isPrivate: false,
	isBanned: false,
	isMuted: false,
	setChannelId: () => { },
	setChannelName: () => { },
	setChannels: () => { },
	setRooms: () => { },
	setChannelUsers: () => { },
	setMuteTimeStamp: () => { },
	setBanTimeStamp: () => { },
	setIsBanned: () => { },
	setIsMuted: () => { },
	messages: [],
	setMessages: () => { },
} );
