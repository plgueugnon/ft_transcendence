export class CreateMessageDto {
	channelId: number;
	senderLogin: string;
	message: string;
	timeStamp: string;
}

export default CreateMessageDto;
