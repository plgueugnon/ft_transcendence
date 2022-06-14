import { EChannelUsers } from '../entities/channelUsers.entity';

export class CreateChannelDto {
	channelIdFront: string;
	channelName   : string;
	owner         : string;
	isPrivate     : boolean;
	users         : string[];
	password      : string;
}

export default CreateChannelDto;
