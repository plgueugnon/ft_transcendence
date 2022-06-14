import { useState } from 'react';
// Left Side of the Chat page
// Utils
import Containers from '../../components/containers';
// Context
import { ChatContext } from '../../contexts/chatContext';
import { INewChannel } from '../../interfaces/newChannelInterface';
import { Grid, Segment } from 'semantic-ui-react';
import { IChannelUsers } from '../chat/interfaces/channelUsers';
import { INewMessage } from '../chat/interfaces/newMessage';
import { ChatLeftBar } from '../chat/elements/ChatLeftBar';
import { ChatRightBar } from '../chat/elements/ChatRightBar';
import { ChatChannelList } from '../chat/components/ChatChannelList';

export function SalonsPage(): JSX.Element {
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
				isPrivate: false,
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
						<Grid.Column stretched width="4" >
							<Segment>
								<ChatLeftBar />
							</Segment>
							<Segment>
								<ChatChannelList />
							</Segment>
						</Grid.Column>
						<Grid.Column stretched width="12">
							<Segment>
								<ChatRightBar />
							</Segment>
						</Grid.Column>
					</Grid>
				</Containers.Page>
			</Containers.NoScroll>
		</ChatContext.Provider>
	);
}
