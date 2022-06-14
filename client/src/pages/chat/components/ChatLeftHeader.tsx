import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { Button, Modal, Form, Header, Dropdown } from 'semantic-ui-react';
import { AuthContext } from '../../../contexts/authContext';
import { ChatContext } from '../../../contexts/chatContext';
import { SocketContext } from '../../../contexts/socketContext';
import { IDropdownItem } from '../../../globals/types';
import { IUsersPublic } from '../../../interfaces/usersPublicInterface';
import { postNewChannel } from '../../../requests/channelsRequests';
import { getUsersInfos } from '../../../requests/usersRequests';
import { INewChannel } from '../../../interfaces/newChannelInterface';
import { CHANNELNAME_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '../../../globals/constants';
import { randString } from '../../../globals/utils';

export function ChatLeftHeader(): JSX.Element {
	const context = useContext( ChatContext );
	const authContext = useContext( AuthContext );
	const userLogin: string = authContext.login;

	const [ open, setOpen ] = useState( false );
	const [ channelName, setChannelName ] = useState( '' );
	const [ users, setUsers ] = useState<string[]>( [] );
	const [ usersList, setUsersList ] = useState<IDropdownItem[]>( [] );
	const [ password, setPassword ] = useState( '' );
	const socket = useContext( SocketContext );

	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );

	// * Create a new channel
	async function submitHandler() {
		setOpen( false );
		const newChannel: INewChannel = {
			channelIdFront: randString( 6 ),
			channelName: channelName,
			isPrivate: true,
			owner: userLogin,
			users: users,
			password: password,
		};
		if ( context.isPrivate === false )
			newChannel.isPrivate = false;
		// TODO : check if no user selected or no channel name or empty password
		const channelId: INewChannel | number = await postNewChannel( newChannel );
		if ( typeof channelId !== 'number' )
			newChannel.channelId = channelId.channelId;

		socket?.emit( 'createChannel', newChannel );

		setChannelName( '' );
		setUsers( [] );
		setPassword( '' );
	}

	// * Get all the users from DB, in order to add them when creating a new channel
	useEffect( (): void => {
		if ( !mounted.current )
			return;
		const fetchData = async () => {
			let dbUsers: IUsersPublic[] | undefined = [];
			dbUsers = await getUsersInfos();
			let usersArray: IDropdownItem[] = [];
			if ( dbUsers !== undefined ) {
				for ( let i = 0; i < dbUsers.length; i++ ) {
					if ( dbUsers[ i ].login !== userLogin ) {
						usersArray.push( {
							key: dbUsers[ i ].login,
							value: dbUsers[ i ].login,
							text: dbUsers[ i ].login,
						} );
					}
				}
			}
			if ( usersArray.length > 0 ) {
				if ( !mounted.current )
					return;
				setUsersList( usersArray );
			}
		};
		if ( !mounted.current )
			return;
		fetchData();
	}, [ open ] );

	return (
		<div style={{ textAlign: 'center' }}>
			<Modal closeOnDimmerClick={false} onClose={() => setOpen( false )} onOpen={() => setOpen( true )} open={open} trigger={<Button> Creer une conversation</Button>}>
				<Modal.Header> Paramètres de la conversation </Modal.Header>
				<Modal.Content>
					<Modal.Description>
						<Header>Merci de remplir les champs suivants pour creer une conversation</Header>
						<br />
					</Modal.Description>
					<Form>
						{/** Channel Name */}
						<Form.Field
							label="Nom de la conversation"
							control="input"
							value={channelName}
							placeholder="Entrez le nom de votre conversation "
							onChange={( e: ChangeEvent<HTMLTextAreaElement> ) => {
								if ( e.target.value.length <= CHANNELNAME_MAX_LENGTH )
									setChannelName( e.target.value );
							}}
						/>
						{/* Channels users  */}

						{context.isPrivate === true && (
							<>
								<Form.Field label="Membres de la conversation"></Form.Field>
								<Dropdown
									placeholder="Selectionnez les membres de la conversation"
									fluid
									multiple
									selection
									options={usersList}
									onChange={( e: any, data: any ) => setUsers( data.value )}
								/>
							</>
						)}
						<Form.Field />
						{/* Channel password */}
						{context.isPrivate === false && (
							<Form.Field
								label="Password"
								control="input"
								type="password"
								value={password}
								onChange={( e: ChangeEvent<HTMLTextAreaElement> ) => {
									if ( e.target.value.length <= PASSWORD_MAX_LENGTH )
										setPassword( e.target.value );
								}}
							/>
						)}
					</Form>
				</Modal.Content>
				<Modal.Actions>
					<Button color="red" onClick={() => setOpen( false )}>
						Annuler
					</Button>
					<Button content="Valider" labelPosition="right" icon="checkmark" onClick={submitHandler} positive />
				</Modal.Actions>
			</Modal>
		</div>
	);
}
