import { useContext, useEffect, useRef, useState } from 'react';
import { Header } from 'semantic-ui-react';
import { AuthContext } from '../../contexts/authContext';
import { ChatContext } from '../../contexts/chatContext';
import { SocketContext } from '../../contexts/socketContext';
import { getUnjoinedPublicChannelsByLogin } from '../../requests/channelsRequests';
import { INewChannel } from '../../interfaces/newChannelInterface';
import { Room } from './Room';
import { IEditChannel } from '../chat/interfaces/editChannel';

export function RoomList(): JSX.Element {
	const context = useContext( ChatContext );
	const userLogin = useContext( AuthContext ).login;
	const socket = useContext( SocketContext );
	const [ delRoom, deleteChannel ] = useState<IEditChannel>();
	const [ count, setCount ] = useState<number>( 0 );

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
			let rooms: INewChannel[] | undefined;
			// * Return all the public channels where the user is not member
			rooms = await getUnjoinedPublicChannelsByLogin( userLogin );
			if ( !mounted.current )
				return;
			context.setRooms( rooms );
		};
		if ( !mounted.current )
			return;
		fetchData();
	}, [ context.channelId, delRoom, count ] );

	socket?.off( 'roomCreated' );
	socket?.on( 'roomCreated', async function ( newRoom: INewChannel ) {
		if ( !mounted.current )
			return;
		setCount( count + 1 );
	} );

	socket?.off( 'roomDeleted' );
	socket?.on( 'roomDeleted', async function ( delroom: IEditChannel ) {
		if ( !mounted.current )
			return;
		deleteChannel( delroom );
		if ( context.channelId === delroom.channelId )
			context.setChannelId( 0 );
	} );

	let i = 0;
	return (
		<>
			<Header textAlign="center">Conversations publiques à rejoindre</Header>
			<div className="chatChannelList">
				{context.rooms &&
					context.rooms.map( ( channels: INewChannel ) => {
						return <Room key={i++} {...channels} channelId={channels.channelId ? channels.channelId : 0} channelName={channels.channelName} />;
					} )}
			</div>
		</>
	);
}
