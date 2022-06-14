import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form, Grid, Header, Icon, Modal, Tab, Table } from 'semantic-ui-react';
import { timeStampToString } from '../../../globals/utils';
import { banChannelUser, editChannelName, editChannelPassword, editChannelUserRole, getUsersByChannelId, kickChannelUser, leaveChannel, muteChannelUser } from '../../../requests/channelsRequests';
import { addTime } from '../../../globals/utils';
import { AuthContext } from '../../../contexts/authContext';
import { ChatContext } from '../../../contexts/chatContext';
import { IChannelUsers } from '../interfaces/channelUsers';
import { IEditChannelUser } from '../interfaces/editChannelUser';
import { IEditChannel } from '../interfaces/editChannel';
import { deleteChannel } from '../../../requests/channelsRequests';
import { IOnlineUser } from '../../../interfaces/userOnlineStatusInterface';
import { SocketContext } from '../../../contexts/socketContext';
import { displayUserStatus } from '../../../components/connectionStatus';
import { CHANNELNAME_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '../../../globals/constants';

// ! Owner : can kick anyone
// ! Admin : can kick anyone except owner
// ! member : can kick himself
export function ChatRightHeader(): JSX.Element {
	const context = useContext( ChatContext );
	const [ open, setOpen ] = useState( false );
	const [ count, setCount ] = useState( 0 );
	const [ newChannelName, setNewChannelName ] = useState( '' );
	const [ newChannelPassword, setNewChannelPassword ] = useState( '' );
	const authContext = useContext( AuthContext );
	const querierRole = useRef<string>();

	// * Socket & connection
	const socket = useContext( SocketContext );
	const [ userConnectStatus, setUserStatus ] = useState<{ login: string; status: string }[]>( [] );

	// * Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );

	// * get list of online users
	useEffect( () => {
		let listOnlineUsers: { login: string; status: string }[] = [];
		socket?.off( 'OnlineUsersToClient' );
		socket?.on( 'OnlineUsersToClient', function ( OnlineUsers: IOnlineUser[] ) {
			OnlineUsers.forEach( ( element ) => {
				listOnlineUsers.push( { login: element.login, status: element.status } );
			} );
			if ( !mounted.current )
				return;
			setUserStatus( listOnlineUsers );
		} );
	}, [ userConnectStatus ] );

	// * Get the channelsUsers of the current channelId, and set timeStamp ban and mute if they are muted or banned
	useEffect( (): void => {
		if ( !mounted.current )
			return;

		if ( context.channelId !== 0 ) {
			getUsersByChannelId( context.channelId ).then( ( channelUsers: IChannelUsers[] | undefined ) => {
				if ( !mounted.current )
					return;
				const userList: IChannelUsers[] = [];
				if ( channelUsers ) {
					for ( let i = 0; i < channelUsers.length; i++ ) {
						if ( channelUsers[ i ].userLogin === authContext.login ) {
							querierRole.current = channelUsers[ i ].role;
							context.setBanTimeStamp( channelUsers[ i ].bannedUntil );
							context.setMuteTimeStamp( channelUsers[ i ].mutedUntil );
						}
						let muteTimesTamp = channelUsers[ i ].mutedUntil;
						let banTimeStamp = channelUsers[ i ].bannedUntil;
						muteTimesTamp = muteTimesTamp ? timeStampToString( new Date( muteTimesTamp ) ) : '';
						banTimeStamp = banTimeStamp ? timeStampToString( new Date( banTimeStamp ) ) : '';
						userList.push( {
							role: channelUsers[ i ].role,
							userLogin: channelUsers[ i ].userLogin,
							mutedUntil: muteTimesTamp,
							bannedUntil: banTimeStamp,
						} );
						context.setChannelUsers( userList );
					}
					if ( !mounted.current )
						return;
					socket?.emit( 'clientRequestOnlineUsers' );
				}
			} );
		}
	}, [ context.channelId, count ] );

	socket?.off( 'updateCtrlPannel' );
	socket?.on( 'updateCtrlPannel', function () {
		if ( !mounted.current )
			return;
		setCount( count + 1 );
	} );

	enum EUserEditAction {
		Mute,
		Ban,
		Kick,
		Role,
	}

	// * send a request to try to rename the channel
	async function handleEditChannelName(): Promise<void> {
		const newChannel: IEditChannel = {
			channelId: context.channelId,
			querier: authContext.login,
			channelName: newChannelName,
			password: '',
		};
		editChannelName( newChannel );
		setCount( count + 1 );
		setOpen( false );
	}

	// * send a request to try to mute user in the channel
	async function handleMuteUser( user: IChannelUsers ) {
		// * add 5 minutes to the current time
		const newTimeStamp = addTime( 5 );
		const muteUser: IEditChannelUser = {
			channelId: context.channelId,
			querier: authContext.login,
			userLogin: user.userLogin,
			newRole: '',
			timeStamp: newTimeStamp.toString(),
		};
		muteChannelUser( muteUser );
		setCount( count + 1 );
		setOpen( false );
		socket?.emit( 'userEdit', [ muteUser, EUserEditAction.Mute ] );
	}

	// * send a request to try to ban user in the channel
	async function handleBanUser( user: IChannelUsers ) {
		// * add 5 minutes to the current time
		const newTimeStamp = addTime( 5 );
		const banUser: IEditChannelUser = {
			channelId: context.channelId,
			querier: authContext.login,
			userLogin: user.userLogin,
			timeStamp: newTimeStamp.toString(),
			newRole: '',
		};
		banChannelUser( banUser );
		setCount( count + 1 );
		setOpen( false );
		socket?.emit( 'userEdit', [ banUser, EUserEditAction.Ban ] );
	}

	// * send a request to try to kick user from the channel
	async function handleKickUser( user: IChannelUsers ) {
		const kickUser: IEditChannelUser = {
			channelId: context.channelId,
			querier: authContext.login,
			userLogin: user.userLogin,
			newRole: '',
			timeStamp: '',
		};
		kickChannelUser( kickUser );
		setCount( count + 1 );
		setOpen( false );
		socket?.emit( 'userEdit', [ kickUser, EUserEditAction.Kick ] );
	}

	// * send a request to change ChannelUser role
	async function handleEditRole( user: string, newRole: string ) {
		const changeRole: IEditChannelUser = {
			channelId: context.channelId,
			querier: authContext.login,
			userLogin: user,
			newRole: newRole,
			timeStamp: '',
		};
		editChannelUserRole( changeRole );
		setCount( count + 1 );
		setOpen( false );
		socket?.emit( 'userEdit', [ changeRole, EUserEditAction.Role ] );
	}

	async function handleLeaveChannel(): Promise<void> {
		const toLeaveChannel: IEditChannelUser = {
			channelId: context.channelId,
			querier: authContext.login,
			userLogin: authContext.login,
			newRole: '',
			timeStamp: '',
		};
		leaveChannel( toLeaveChannel );
		setCount( count + 1 );
		context.setRooms( context.rooms );
		context.setChannelId( 0 );
		setOpen( false );
		socket?.emit( 'userEdit', [ toLeaveChannel, EUserEditAction.Kick ] )
	}

	async function handleDeleteChannel(): Promise<void> {
		const toDeleteChannel: IEditChannel = {
			channelId: context.channelId,
			querier: authContext.login,
			channelName: '',
			password: '',
		};
		deleteChannel( toDeleteChannel );
		setCount( count + 1 );
		setOpen( false );
		socket?.emit( 'deleteChannel', toDeleteChannel );
	}

	async function handleEditChannelPassword(): Promise<void> {
		const editChannel: IEditChannel = {
			channelId: context.channelId,
			querier: authContext.login,
			channelName: '',
			password: newChannelPassword,
		};
		editChannelPassword( editChannel );
		setNewChannelPassword( '' );
		setCount( count + 1 );
		setOpen( false );
	}

	function setAsOwnerButton( user: IChannelUsers ): JSX.Element {
		if ( querierRole.current === 'Owner' && user.role !== 'Owner' )
			return <Icon name="chess king" size="large" color="black" className="pointer" onClick={() => handleEditRole( user.userLogin, 'Owner' )} />;
		else
			return <Icon name="chess king" size="large" color="grey" />;
	}

	function setAsAdminButton( user: IChannelUsers ): JSX.Element {
		if ( querierRole.current === 'Owner' && user.role !== 'Owner' && user.role !== 'Admin' )
			return <Icon name="chess knight" size="large" color="black" className="pointer" onClick={() => handleEditRole( user.userLogin, 'Admin' )} />;
		else
			return <Icon name="chess knight" size="large" color="grey" />;
	}

	function setAsMemberButton( user: IChannelUsers ): JSX.Element {
		if ( querierRole.current === 'Owner' && user.role !== 'Owner' && user.role !== 'Member' )
			return <Icon name="chess pawn" size="large" color="black" className="pointer" onClick={() => handleEditRole( user.userLogin, 'Member' )} />;
		else
			return <Icon name="chess pawn" size="large" color="grey" />;
	}

	function muteUserButton( user: IChannelUsers ): JSX.Element {
		// ! commente pour faire des tests
		if ( ( querierRole.current === 'Owner' && user.role !== 'Owner' ) ||
			( querierRole.current === 'Admin' && user.role === 'Member' ) )
			// if ( querierRole.current === 'Owner')
			return <Icon className="pointer" name="mute" color="black" size="large" onClick={() => handleMuteUser( user )} />;
		else
			return ( <Icon name='mute' color='grey' size='large' /> )
	}

	function banUserButton( user: IChannelUsers ): JSX.Element {
		// ! commente pour faire des tests
		if ( ( querierRole.current === 'Owner' && user.role !== 'Owner' ) ||
			( querierRole.current === 'Admin' && user.role === 'Member' ) )
			// if ( querierRole.current === 'Owner' )
			return <Icon className="pointer" name="eye slash" color="black" size="large" onClick={() => handleBanUser( user )} />;
		else
			return <Icon name="eye slash" color="grey" size="large" />;
	}

	function kickUserButton( user: IChannelUsers ): JSX.Element {
		if ( ( querierRole.current === 'Owner' && user.role !== 'Owner' ) || ( querierRole.current === 'Admin' && user.role === 'Member' ) )
			return <Icon className="pointer" name="ban" color="black" size="large" onClick={() => handleKickUser( user )} />;
		else
			return <Icon name="ban" color="grey" size="large" />;
	}

	function deleteChannelButton(): JSX.Element {
		if ( querierRole.current === 'Owner' )
			return (
				<>
					<Header>Voulez-vous vraiment supprimer cette conversation?</Header>
					<Button negative onClick={() => handleDeleteChannel()}>
						Supprimer la conversation
					</Button>
				</>
			);
		else
			return <Header> Vous devez etre le proprietaire de la conversation pour la supprimer.</Header>;
	}

	function editChannelNameTab(): JSX.Element {
		if ( querierRole.current === 'Owner' )
			return (
				<>
					<Header textAlign="center">{context.channelName}</Header>
					<Header>Voulez-vous renommer cette conversation ?</Header>
					<Grid>
						<Grid.Row>
							<Grid.Column width={13}>
								<Form>
									<Form.Field
										control="input"
										value={newChannelName}
										placeholder="New channel name"
										onChange={( e: any ) => {
											if ( e.target.value.length <= CHANNELNAME_MAX_LENGTH )
												setNewChannelName( e.target.value );
										}}
									/>
								</Form>
							</Grid.Column>
							<Grid.Column width={3}>
								<Button fluid positive content="Apply" type="submit" onClick={() => handleEditChannelName()} />
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</>
			);
		else
			return (
				<Header> Vous devez etre le proprietaire de la conversation pour la renommer.</Header>
			);
	}

	function editChannelPasswordTab(): JSX.Element {
		if ( context.isPrivate === true )
			return (
				<Header>
					<br />
					Cette conversation est privée, vous ne pouvez pas la protéger avec un mot de passe.
				</Header>
			)
		else if ( context.isPrivate === false && querierRole.current === 'Owner' )
			return (
				<><Header>
					<br />
					Si vous voulez modifier le mot de passe de cette conversation, entrez le nouveau mot de passe ci-dessous.
					<br />
				</Header><div>Si aucun mot de passe n'est entré, la conversation sera publique.</div><br /><Grid>
						<Grid.Row>
							<Grid.Column width={13}>
								<Form>
									<Form.Field
										control="input"
										value={newChannelPassword}
										placeholder="New channel password"
										type="password"
										onChange={( e: any ) => {
											if ( e.target.value.length < PASSWORD_MAX_LENGTH )
												setNewChannelPassword( e.target.value );
										}} />
								</Form>
							</Grid.Column>
							<Grid.Column width={3}>
								<Button fluid positive content="Apply" type="submit" onClick={() => handleEditChannelPassword()} />
							</Grid.Column>
						</Grid.Row>
					</Grid></>
			)
		else
			return (
				<Header> Vous devez etre le proprietaire de la conversation pour modifier le mot de passe.</Header>
			);
	}


	const style = {
		borderColor: '#e0e0e0',
		borderStyle: 'solid',
		borderWidth: '1px',
		borderRadius: '5px',
		margin: '10px',
	};

	const panes = [
		// * rename channel
		{
			menuItem: 'Nom',
			render: () => ( <> {editChannelNameTab()} </> )
		},
		// * users list and info
		{
			menuItem: 'Informations',
			render: () => (
				<Table textAlign="center">
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Login</Table.HeaderCell>
							<Table.HeaderCell>Role</Table.HeaderCell>
							<Table.HeaderCell>Muted until</Table.HeaderCell>
							<Table.HeaderCell>Banned until</Table.HeaderCell>
							<Table.HeaderCell>Status</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{/* get users by channelId */}
						{context.channelUsers.map( ( user: IChannelUsers ) => (
							<Table.Row key={user.userLogin}>
								<Table.Cell>{user.userLogin}</Table.Cell>
								<Table.Cell>{user.role}</Table.Cell>
								<Table.Cell>{user.mutedUntil}</Table.Cell>
								<Table.Cell>{user.bannedUntil}</Table.Cell>
								{displayUserStatus( user.userLogin, userConnectStatus )}
							</Table.Row>
						) )}
					</Table.Body>
				</Table>
			),
		},
		{
			// * action on members : mute/ban/kick/ change role
			menuItem: 'Actions',
			render: () => (
				<Table textAlign="center">
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Login</Table.HeaderCell>
							<Table.HeaderCell>Role</Table.HeaderCell>
							<Table.HeaderCell>
								Set as
								<br /> Owner
							</Table.HeaderCell>
							<Table.HeaderCell>
								Set as
								<br /> Admin
							</Table.HeaderCell>
							<Table.HeaderCell>
								Set as
								<br /> Member
							</Table.HeaderCell>
							<Table.HeaderCell>Mute User</Table.HeaderCell>
							<Table.HeaderCell>Ban User</Table.HeaderCell>
							<Table.HeaderCell>Kick User</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{/* get users by channelId */}
						{context.channelUsers.map( ( user: IChannelUsers ) => (
							<Table.Row key={user.userLogin}>
								<Table.Cell>{user.userLogin}</Table.Cell>
								<Table.Cell> {user.role} </Table.Cell>
								<Table.Cell> {setAsOwnerButton( user )} </Table.Cell>
								<Table.Cell> {setAsAdminButton( user )} </Table.Cell>
								<Table.Cell> {setAsMemberButton( user )} </Table.Cell>
								<Table.Cell> {muteUserButton( user )} </Table.Cell>
								<Table.Cell> {banUserButton( user )} </Table.Cell>
								<Table.Cell> {kickUserButton( user )} </Table.Cell>
							</Table.Row>
						) )}
					</Table.Body>
				</Table>
			),
		},
		{
			// * edit password
			menuItem: 'Password',
			render: () => ( <> {editChannelPasswordTab()} </> ),
		},
		{
			// * Leave channel
			menuItem: 'Quitter',
			render: () => (
				<>
					<Header>Voulez-vous vraiment quitter cette conversation ?</Header>
					<div>
						<Button negative onClick={() => handleLeaveChannel()}>
							Quitter la conversation
						</Button>
					</div>
				</>
			),
		},
		{
			// * delete channel
			menuItem: 'Supprimer',
			render: () => <>{deleteChannelButton()}</>,
		},
	];

	//  * if no channel id selected, display to choose a channel
	if ( context.channelId === 0 )
		return (
			<Grid style={style}>
				<Grid.Row>
					<Grid.Column width={14}>
						<Header as="h3" icon textAlign="center">
							Merci de choisir une conversation
						</Header>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		);
	//  * else display messages and modal to edit settings
	else
		return (
			<Grid style={style}>
				<Grid.Row>
					<Grid.Column width={14}>
						{/* name of the channel */}
						<Header as="h3" icon textAlign="center">
							{context && context.channelName !== '' ? context.channelName : 'No name'}
						</Header>
					</Grid.Column>
					<Grid.Column width={2}>
						{/* Modal settings */}
						<Modal
							closeOnDimmerClick={false}
							onClose={() => setOpen( false )}
							onOpen={() => setOpen( true )}
							open={open}
							trigger={
								<Icon className="pointer" name="setting" size="big">
									{' '}
								</Icon>
							}
						>
							<Modal.Header>Paramètres de la conversation</Modal.Header>
							<Modal.Content>
								<Modal.Description></Modal.Description>
								<Tab panes={panes} />
							</Modal.Content>
							<Modal.Actions>
								<Button color="red" onClick={() => setOpen( false )}>
									Annuler
								</Button>
							</Modal.Actions>
						</Modal>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		);
}
