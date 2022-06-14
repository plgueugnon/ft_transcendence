import { EChannelRole } from './../entities/channelUsers.entity';
export class EditUserDto {
	channelId: number;
	querier: string;
	userLogin: string;
	timeStamp: string;
	newRole: EChannelRole;
}
