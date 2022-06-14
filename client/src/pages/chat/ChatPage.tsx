import { useState } from 'react';
// Left Side of the Chat page
import { ChatLeftBar } from './elements/ChatLeftBar';
// Right Side of the Chat page
import { ChatRightBar } from './elements/ChatRightBar';
// Utils
import Containers from '../../components/containers';
// Context
import { ChatContext } from '../../contexts/chatContext';

import { INewChannel } from '../../interfaces/newChannelInterface';
import { IChannelUsers } from './interfaces/channelUsers';
import { INewMessage } from './interfaces/newMessage';
import { Grid, Segment } from 'semantic-ui-react';

export function ChatPage(): JSX.Element {
	const [ channelId, setChannelId ] = useState<number>( 0 );
	const [ channelName, setChannelName ] = useState<string>( '' );
	const [ channels, setChannels ] = useState<INewChannel[]>( [] );
	const [ rooms, setRooms ] = useState<INewChannel[]>( [] );
	const [ channelUsers, setChannelUsers ] = useState<IChannelUsers[]>( [] );
	const [ messages, setMessages ] = useState<INewMessage[]>( [] );
	const [ muteTimeStamp, setMuteTimeStamp ] = useState<string | null>( null );
	const [ banTimeStamp, setBanTimeStamp ] = useState<string | null>( null );
	const [ isMuted, setIsMuted ] = useState<boolean>( false );
	const [ isBanned, setIsBanned ] = useState<boolean>( false );

	return (
		<ChatContext.Provider
			value={{
				channelId: channelId,
				channelName: channelName,
				channels: channels,
				rooms: rooms,
				channelUsers: channelUsers,
				messages: messages,
				muteTimeStamp: muteTimeStamp,
				banTimeStamp: banTimeStamp,
				isPrivate: true,
				isBanned: isBanned,
				isMuted: isMuted,
				setBanTimeStamp: setBanTimeStamp,
				setMuteTimeStamp: setMuteTimeStamp,
				setChannelId: setChannelId,
				setChannelName: setChannelName,
				setChannels: setChannels,
				setRooms: setRooms,
				setChannelUsers: setChannelUsers,
				setIsBanned: setIsBanned,
				setIsMuted: setIsMuted,
				setMessages: setMessages,
			}}
		>
			<Containers.NoScroll>
				<Containers.Page>
					<Grid columns={2}>
						<Grid.Column stretched width="4">
							<Segment>
								<ChatLeftBar />
							</Segment>
						</Grid.Column>
						<Grid.Column stretched width="12">
							<Segment>
								<ChatRightBar />
							</Segment>
						</Grid.Column>
					</Grid>
					{/* </div> */}
				</Containers.Page>
			</Containers.NoScroll>
		</ChatContext.Provider>
	);
}
