import { ChatMessageList } from '../components/ChatMessageList';
import { ChatRightHeader } from '../components/ChatRightHeader';
import { ChatInputBar } from '../components/ChatInputBar';
import { Comment } from 'semantic-ui-react';

export function ChatRightBar(): JSX.Element {
	return (
		<div className="chatRightBar" style={{ margin: '2px' }}>
			<Comment.Group style={{ maxWidth: '100%' }}>
				<ChatRightHeader />
				<ChatMessageList />
				<ChatInputBar />
			</Comment.Group>
		</div>
	);
}
