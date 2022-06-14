export interface IChannelProps {
	channelId: number;
	channelName: string;
	owner: string;
	isPrivate: boolean;
	users: string[];
	password: string;
}
