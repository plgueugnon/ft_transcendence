export interface INewChannel {
	channelId?: number;
	channelName: string;
	owner: string;
	isPrivate: boolean;
	users: string[];
	password: string;
}

export interface IEditChannel {
	channelId: number;
	querier: string;
	channelName: string;
	password: string;
}

export interface IEditChannelUser {
	channelId: number;
	querier: string;
	userLogin: string;
	timeStamp: string;
	newRole: string;
}
