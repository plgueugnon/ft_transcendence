import { useContext, useEffect, useRef, useState } from 'react';
import { Header } from 'semantic-ui-react';
import { AuthContext } from '../../../contexts/authContext';
import { ChatContext } from '../../../contexts/chatContext';
import { SocketContext } from '../../../contexts/socketContext';
import { getJoinedPublicChannelsByLogin, getPrivateChannelsByLogin } from '../../../requests/channelsRequests';
import { ChatChannel } from './ChatChannel';
import { INewChannel } from '../../../interfaces/newChannelInterface';
import { IEditChannel } from '../interfaces/editChannel';
import { IEditChannelUser } from '../interfaces/editChannelUser';

export function ChatChannelList(): JSX.Element {
	const context = useContext( ChatContext );
	const userLogin = useContext( AuthContext ).login;
	const socket = useContext( SocketContext );
	const [ count, setCount ] = useState<number>( 0 );
	const [ update, setUpdate ] = useState<number>( 0 );

	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );

	useEffect( () => {
		if ( !mounted.current )
			return;
		const fetchData = async () => {
			let channels: INewChannel[] | undefined;
			if ( context.isPrivate === true )
				// * Return all the private channels where the user is member
				channels = await getPrivateChannelsByLogin( userLogin );
			// * Return all the Public channels where the user is member
			else
				channels = await getJoinedPublicChannelsByLogin( userLogin );
			if ( !mounted.current )
				return;
			context.setChannels( channels );
		};
		if ( !mounted.current )
			return;
		fetchData();
	}, [ update ] );

	socket?.off( 'updateJoinedRooms' );
	socket?.on( 'updateJoinedRooms', function () {
		if ( !mounted.current )
			return;
		setUpdate( update + 1 )
	} );


	useEffect( () => {

	}, [ context.channels, count ] )

	socket?.off( 'channelCreated' );
	socket?.on( 'channelCreated', async function ( newChannel: INewChannel ) {
		if ( newChannel.users.find( ( element ) => element === userLogin ) || newChannel.owner === userLogin ) {
			if ( !mounted.current )
				return;
			if ( context.isPrivate === true && newChannel.isPrivate === true )
				context.setChannels( ( prevState: INewChannel[] ) => [ ...prevState, newChannel ] );
			else if ( context.isPrivate === false && newChannel.isPrivate === false )
				context.setChannels( ( prevState: INewChannel[] ) => [ ...prevState, newChannel ] );
		}
	} );

	socket?.off( 'channelDeleted' );
	socket?.on( 'channelDeleted', async function ( delChannel: IEditChannel ) {
		if ( !mounted.current )
			return;

		let channels: INewChannel[] = context.channels;
		let i: number = channels.findIndex( ( element ) => element.channelId === delChannel.channelId )
		if ( i >= 0 ) {
			channels.splice( i, 1 );
			context.setChannels( channels );
			if ( context.channelId === delChannel.channelId )
				context.setChannelId( 0 );

			socket?.emit( 'leaveRoom', delChannel.channelId.toString() );
			setCount( count + 1 );
		}
	} );

	socket?.off( 'userKickOut' );
	socket?.on( 'userKickOut', function ( kickUser: IEditChannelUser ) {
		if ( userLogin === kickUser.userLogin ) {
			let delChannel: IEditChannel = {
				channelId: kickUser.channelId,
				querier: kickUser.querier,
				channelName: '',
				password: '',
			};
			if ( !mounted.current )
				return;
			let channels: INewChannel[] = context.channels;
			let i: number = channels.findIndex( ( element ) => element.channelId === delChannel.channelId )
			if ( i >= 0 ) {
				channels.splice( i, 1 );
				context.setChannels( channels );
			}

			if ( context.channelId === kickUser.channelId )
				context.setChannelId( 0 );
			socket?.emit( 'leaveRoom', kickUser.channelId.toString() );
			setCount( count + 1 );
		}
	} );

	let i = 0;
	return (
		<>
			{context.isPrivate === true && <Header textAlign="center">Tes conversations privées</Header>}
			{context.isPrivate === false && <Header textAlign="center">Tes conversations publiques</Header>}

			<div className="chatChannelList">
				{context.channels &&
					context.channels.map( ( channels: INewChannel ) => {
						return <ChatChannel key={i++} {...channels} channelId={channels.channelId ? channels.channelId : 0} channelName={channels.channelName} />;
					} )}
			</div>
		</>
	);
}
