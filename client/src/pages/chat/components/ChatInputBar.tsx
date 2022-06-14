import { SyntheticEvent, useEffect, useState } from 'react';
import { postNewMessage } from '../../../requests/messagesRequests';
import { TextArea, Button } from 'semantic-ui-react';
// socket
import { SocketContext } from '../../../contexts/socketContext';
import { useContext } from 'react';
// auth
import { AuthContext } from '../../../contexts/authContext';
import { ChatContext } from '../../../contexts/chatContext';
import { INewMessage } from '../interfaces/newMessage';
import { IEditChannelUser } from '../interfaces/editChannelUser';
import { APP_PLAY_PATH, MESSAGE_INVITE_FORMAT, MESSAGE_MAX_LENGTH, REDIRECT_LOGIN_INVITE_FROM_CHAT, ACTION_TAG_INVITE_FROM_CHAT, REDIRECT_VALUE_INVITE } from '../../../globals/constants';
import { useNavigate } from 'react-router-dom';

export function ChatInputBar(): JSX.Element {
	const [ message, setMessage ] = useState( '' );                   // message to send
	const context = useContext( ChatContext );
	const socket = useContext( SocketContext );
	const authContext = useContext( AuthContext );
	const navigate = useNavigate();

	//* On message change
	// If message is preformat one, send automaticly and navigate
	useEffect( () => {
		if ( message === MESSAGE_INVITE_FORMAT )
			sendInvite();
	}, [ message ] )

	const	inviteHandler = () => {
		setMessage( MESSAGE_INVITE_FORMAT );
	}

	const	sendInvite = async () => {
		// Get login to invite
		const	loginToInvite = context.channelUsers.filter( ( channelUser ) => channelUser.userLogin !== authContext.login )[ 0 ].userLogin;
		if ( !loginToInvite )
			return ;

		// Send message
		await submitHandler( undefined );

		// Redirect to play
		navigate(
			APP_PLAY_PATH + '?' + ACTION_TAG_INVITE_FROM_CHAT + '=' + REDIRECT_VALUE_INVITE
			+ '&' + REDIRECT_LOGIN_INVITE_FROM_CHAT + '=' + loginToInvite
		);
		                                                                                                                              // tmp
	}

	async function submitHandler( e: SyntheticEvent | undefined ): Promise<void> {
		if ( e )
			e.preventDefault();
		if ( message !== '' ) {
			let muteDate: Date = new Date();
			let banDate: Date = new Date();
			let currentDate: Date = new Date();
			if ( context.muteTimeStamp !== null )
				muteDate = new Date( context.muteTimeStamp );
			if ( context.banTimeStamp !== null )
				banDate = new Date( context.banTimeStamp );
			if ( currentDate >= muteDate && currentDate >= banDate ) {
				const newMessage: INewMessage = {
					// props channelId from ChatPage Hook
					channelId: context.channelId,
					senderLogin: authContext.login,
					message: message,
					timeStamp: new Date().toString(),
				};
				await postNewMessage( newMessage );
				socket?.emit( 'msgToServer', newMessage );
				setMessage( '' );
			}
		}
	}

	socket?.off( 'userMute' );
	socket?.on( 'userMute', function ( muteUser: IEditChannelUser ) {
		if ( muteUser.userLogin === authContext.login )
			context.setMuteTimeStamp( muteUser.timeStamp );
	} );

	const chatBarStyle = {
		display: 'flex',
	};
	const textStyle = {
		width: '70%',
		height: '70px',
		margin: '10px',
		alignSelf: 'center',
	};

	const buttonStyle = {
		width: '20%',
		height: '70px',
		margin: '10px',
		alignSelf: 'center',
	};

	if ( context.channelId === 0 )
		return <div></div>;
	else
		return (
			<div className="chatInputBar" style={chatBarStyle}>
				{
					context.channelUsers.length === 2
					&&
						<Button style={buttonStyle} size="large" className="chatInputBarButton" onClick={inviteHandler}>
							Inviter à jouer
						</Button>
				}
				<TextArea
					type="text"
					value={message}
					placeholder="Ecrire ici"
					style={textStyle}
					onChange={( e ) => {
						if (
							// e.target.value !== '' &&
							e.target.value.length < MESSAGE_MAX_LENGTH
						)
							setMessage( e.target.value );
					}}
				/>
				<Button style={buttonStyle} size="large" className="chatInputBarButton" onClick={submitHandler}>
					Envoyer
				</Button>
			</div>
		);
}
