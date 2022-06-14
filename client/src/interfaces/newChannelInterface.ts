export interface INewChannel {
	channelId?     : number;
	channelIdFront?: string;
	channelName    : string;
	owner          : string;
	isPrivate      : boolean;
	users          : string[];
	password       : string;
}
