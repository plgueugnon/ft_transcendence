import { ChatChannelList } from '../chat/components/ChatChannelList';
import { Header } from 'semantic-ui-react';

export function RoomLeftBar(): JSX.Element {
	return (
		<div className="chatLeftBar">
			<Header textAlign="center">Conversations publiques à rejoindre</Header>
			<ChatChannelList />
		</div>
	);
}
