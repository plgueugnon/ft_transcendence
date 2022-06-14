import { useContext } from 'react';
import { Comment } from 'semantic-ui-react';
import { ChatContext } from '../../../contexts/chatContext';
import { SocketContext } from '../../../contexts/socketContext';
import { IChannelProps } from '../interfaces/channel';
import './ChatChannel.css';

export function ChatChannel( props: IChannelProps ): JSX.Element {
	const context = useContext( ChatContext );
	const socket = useContext( SocketContext );

	const style = {
		borderRadius: '4px',
		boxShadow: '0px 0px 0px 1px rgba(0,0,0,0.1)',
		minHeight: '50px',
		marginLeft: '1%',
		padding: '10px',
		margin: '10px',
	};

	async function handleClick(): Promise<void> {
		context.setChannelId( props.channelId );
		context.setChannelName( props.channelName );

		socket?.emit( 'joinRoom', [ props.channelId.toString(), 'private' ] );
	}

	return (
		<Comment className="chatChannel" style={style} onClick={handleClick}>
			<Comment.Content>
				<Comment.Text>{props.channelName !== '' ? props.channelName : 'No name'}</Comment.Text>
			</Comment.Content>
		</Comment>
	);
}
