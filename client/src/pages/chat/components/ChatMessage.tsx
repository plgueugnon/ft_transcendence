import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../../contexts/authContext';
import { getUserPublic } from '../../../requests/usersRequests';
import { Button, Comment, Icon } from 'semantic-ui-react';
import { timeStampToString } from '../../../globals/utils';
import { INewMessage } from '../interfaces/newMessage';
import { ChatContext } from '../../../contexts/chatContext';
import { useNavigate } from 'react-router-dom';
import { APP_PLAY_PATH, APP_USER_SEARCH_PATH, MESSAGE_INVITE_FORMAT, REDIRECT_LOGIN_INVITE_FROM_CHAT, ACTION_TAG_INVITE_FROM_CHAT, REDIRECT_VALUE_JOIN } from '../../../globals/constants';
import { IUsersPublic } from '../../../interfaces/usersPublicInterface';
import { getBlockedLogins } from '../../../requests/blocksRequests';
export interface ISenderInfos {
	name?: string;
	avatar?: string;
}
export function ChatMessage( props: INewMessage ): JSX.Element {
	/**
	 * HOOKS
	 */
	const [ senderInfos, setSenderInfos ] = useState<ISenderInfos>( { name: '', avatar: '' } );
	// get login from the context
	const authContext = useContext( AuthContext );
	const context = useContext( ChatContext );
	const userLogin: string = authContext.login;
	const navigate = useNavigate();
	const [ isBlocked, setIsBlocked ] = useState( false );

	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );

	/**
	 * UseEffect
	 */
	// * Get the nickname and the avatar of the user who sent the  Message
	useEffect( () => {
		const controller = new AbortController();
		if ( props.senderLogin ) {
			const fetchData = async () => {
				let userInfos: IUsersPublic | undefined;
				// ! A tester lorsque block sera okay
				let blockedUsers: string[] | undefined;
				blockedUsers = await getBlockedLogins();
				if ( !mounted.current )
					return;
				if ( blockedUsers ) {
					for ( let i = 0; i < blockedUsers.length; i++ ) {
						if ( blockedUsers[ i ] === props.senderLogin )
							setIsBlocked( true );
					}
				}
				if ( isBlocked === true )
					return;
				// * if user is banned
				userInfos = await getUserPublic( props.senderLogin );
				if ( !mounted.current )
					return;
				if ( userInfos !== undefined ) {
					const senderInfos: ISenderInfos = {
						name: userInfos.name,
						avatar: userInfos.avatarUrl,
					};
					setSenderInfos( senderInfos );
				}
			};
			fetchData();
		}
		return () => {
			// * cancel getUserPublic requests before component unmounts to avoid leaks
			controller.abort();
		};
	}, [ props.senderLogin ] );

	const	handleClickJoinGame = () => {
		navigate(
			APP_PLAY_PATH + '?' + ACTION_TAG_INVITE_FROM_CHAT + '=' + REDIRECT_VALUE_JOIN
			+ '&' + REDIRECT_LOGIN_INVITE_FROM_CHAT + '=' + props.senderLogin
		)
	}

	// * Convert timestamp to string and format it
	let timeStamp;
	if ( props.timeStamp ) {
		timeStamp = timeStampToString( new Date( props.timeStamp ) );
	}

	const leftStyle = {
		borderRadius: '4px',
		boxShadow: '0px 0px 0px 1px rgba(0,0,0,0.1)',
		maxWidth: '80%',
		marginLeft: '1%',
	};

	const rightStyle = {
		borderRadius: '4px',
		boxShadow: '0px 0px 0px 1px rgba(0,0,0,0.1)',
		maxWidth: '80%',
		marginLeft: '19%',
	};

	if ( isBlocked === false )
		return (
			<Comment style={props.senderLogin && props.senderLogin === userLogin ? rightStyle : leftStyle}>
				<Comment.Avatar className="pointer" onClick={() => navigate( APP_USER_SEARCH_PATH + '/' + props.senderLogin )} as="a" src={senderInfos.avatar} />
				<Comment.Content>
					<Comment.Author onClick={() => navigate( APP_USER_SEARCH_PATH + '/' + props.senderLogin )} as="a">
						{senderInfos.name}
					</Comment.Author>
					<Comment.Metadata>
						<span>{timeStamp}</span>
					</Comment.Metadata>
					<Comment.Text>
						{
							props.message !== MESSAGE_INVITE_FORMAT
							?
							// Classic message
								props.message
							:
							// Invite to play
								<>
									<br/>
									<Button basic
										onClick={ handleClickJoinGame }
									>
										<Icon name='gamepad' />Hey ! Tu veux jouer ?
									</Button>
									<br/><br/>
								</>
						}
					</Comment.Text>
				</Comment.Content>
			</Comment>
		);
	else return <></>;
}
