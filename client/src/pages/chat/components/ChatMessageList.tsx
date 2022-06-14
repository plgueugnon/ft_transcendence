import { useContext, useEffect, useRef, useState } from 'react';
import { Header } from 'semantic-ui-react';
import { AuthContext } from '../../../contexts/authContext';
import { ChatContext } from '../../../contexts/chatContext';
import { SocketContext } from '../../../contexts/socketContext';
import { getUsersByChannelId } from '../../../requests/channelsRequests';
import { getMessagesByChannel } from '../../../requests/messagesRequests';
import { IChannelUsers } from '../interfaces/channelUsers';
import { IEditChannelUser } from '../interfaces/editChannelUser';
import { INewMessage } from '../interfaces/newMessage';
import { ChatMessage } from './ChatMessage';

export function ChatMessageList(): JSX.Element {
	const context = useContext( ChatContext );
	// ? HOOKS
	const [ newMessages, updateMessages ] = useState<INewMessage[]>( [] );
	const [ isBanned, setIsBanned ] = useState<boolean>( false );
	const socket = useContext( SocketContext );
	const authContext = useContext( AuthContext );

	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );

	socket?.off( 'userBan' );
	socket?.on( 'userBan', function ( banUser: IEditChannelUser ) {
		// * A modifier / adapter en fonction fix fonction ban
		if ( banUser.userLogin === authContext.login ) {
			setIsBanned( true );
			context.setBanTimeStamp( banUser.timeStamp );
		}
	} );

	// * Get all the message of the channelId if the user is not banned
	useEffect( () => {
		if ( !mounted.current )
			return;
		const fetchData = async () => {
			let banTimeStamp = null;
			const channelUsers: IChannelUsers[] | undefined = await getUsersByChannelId( context.channelId );
			if ( !mounted.current )
				return;
			if ( channelUsers ) {
				for ( let i = 0; i < channelUsers.length; i++ ) {
					if ( channelUsers[ i ].userLogin === authContext.login )
						banTimeStamp = channelUsers[ i ].bannedUntil;
				}
				let banDate = new Date();
				let currentDate = new Date();
				if ( banTimeStamp !== null )
					banDate = new Date( banTimeStamp );
				if ( banDate === null || currentDate >= banDate ) {
					// debugger
					setIsBanned( false );
					let historicMessages: INewMessage[] | undefined = [];
					historicMessages = await getMessagesByChannel( context.channelId );
					if ( !mounted.current )
						return;
					await context.setMessages( historicMessages );
				}
				// * if user is banned
				else
					setIsBanned( true );
			}
		};
		fetchData();
		return () => {
			socket?.emit( 'leaveRoom', context.channelId.toString() );
			updateMessages( [] );
		};
	}, [ context.channelId, isBanned ] );

	// ! Fix double event trigger mais solution non optimale mais obligatoire en raison des limites de nestjs pour l'emit
	socket?.off( 'msgToClient' );
	socket?.on( 'msgToClient', async function ( newMessage: INewMessage, channelID: number ) {
		if ( channelID === context.channelId ) {
			updateMessages( ( prevState: INewMessage[] ) => [ ...prevState, newMessage ] );
		}
	} );

	let i = 0;
	return (
		<div style={{ overflowY: 'scroll', height: 'calc(63vh)', paddingTop: '30px' }} className="chatMessageList">
			{isBanned === true && <Header align="center">Vous avez été banni du chat</Header>}
			{isBanned === false &&
				context.messages &&
				context.messages.map( ( messages: INewMessage ) => {
					return <ChatMessage key={i++} {...messages} />;
				} )}
			{isBanned === false &&
				newMessages.map( ( messages: INewMessage ) => {
					return <ChatMessage key={i++} {...messages} />;
				} )}
		</div>
	);
}
