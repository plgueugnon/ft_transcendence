import { ChatLeftHeader } from '../components/ChatLeftHeader';
import { ChatChannelList } from '../components/ChatChannelList';
import { RoomList } from '../../salons/RoomList';
import { ChatContext } from '../../../contexts/chatContext';
import { useContext } from 'react';

export function ChatLeftBar(): JSX.Element {
	const context = useContext( ChatContext );

	return (
		<div className="chatLeftBar">
			<ChatLeftHeader />
			{context.isPrivate === true && <ChatChannelList />}
			{context.isPrivate === false && <RoomList />}
		</div>
	);
}
