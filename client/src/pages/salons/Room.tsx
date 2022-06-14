import { useEffect } from 'react';
import { ChangeEvent, useContext, useState } from 'react';
import { Button, Comment, Form, Header, Modal } from 'semantic-ui-react';
import { AuthContext } from '../../contexts/authContext';
import { ChatContext } from '../../contexts/chatContext';
import { SocketContext } from '../../contexts/socketContext';
import { joinPublicChannel } from '../../requests/channelsRequests';
import { IChannelProps } from '../chat/interfaces/channel';
import { IEditChannel } from '../chat/interfaces/editChannel';
import snifGif from '../../images/snif.gif';
import { PASSWORD_MAX_LENGTH } from '../../globals/constants';
export function Room( props: IChannelProps ): JSX.Element {
	const context = useContext( ChatContext );
	const authContext = useContext( AuthContext );
	const socket = useContext( SocketContext );
	const [ open, setOpen ] = useState( false );
	const [ openAction, setOpenAction ] = useState( false );
	const [ password, setPassword ] = useState<string>( '' );
	const [ isProtected, setIsProtected ] = useState<boolean | undefined>( false );

	useEffect( (): void => {
		if ( props.password === null )
			setIsProtected( false );
		else
			setIsProtected( true );
	}, [ context.rooms ] );

	const style = {
		borderRadius: '4px',
		boxShadow: '0px 0px 0px 1px rgba(0,0,0,0.1)',
		minHeight: '50px',
		marginLeft: '1%',
		padding: '10px',
		margin: '10px',
	};

	function handleClick(): void {
		setOpen( true );
		setPassword( '' );
	}

	function submitHandler(): void {
		const joinChannel: IEditChannel = {
			channelId: props.channelId,
			querier: authContext.login,
			channelName: props.channelName,
			password: password,
		};
		try {
			joinPublicChannel( joinChannel ).then( async ( res ) => {
				if ( res === 201 ) {
					setOpen( false );
					setPassword( '' );
					setIsProtected( true );
					context.setChannelId( props.channelId );
					context.setChannelName( props.channelName );
					socket?.emit( 'joinRoom', [ props.channelId.toString(), 'public' ] );
				} else {
					setOpenAction( true );
					setPassword( '' );
				}
			} );
		} catch ( e ) {
		}
	}

	return (
		<>
			<Modal closeOnDimmerClick={false} onClose={() => setOpen( false )} onOpen={() => setOpen( true )} open={open}>
				<Modal.Header>Conversations publiques</Modal.Header>
				<Modal.Content>
					<Modal.Description>
						{isProtected === false ? (
							<Header>Cette conversation n'est pas protégée par un mot de passe.</Header>
						) : (
							<>
								<Header>Veuillez entrer votre mot de passe pour rejoindre la conversation.</Header>
								<Form>
									{/* Channel password */}
									{context.isPrivate === false && (
										<Form.Field
											label="Password"
											control="input"
											value={password}
											type="password"
											onChange={( e: ChangeEvent<HTMLTextAreaElement> ) => {
												if ( e.target.value.length < PASSWORD_MAX_LENGTH )
													setPassword( e.target.value );
											}}
										/>
									)}
								</Form>
							</>
						)}
						<br />
					</Modal.Description>
				</Modal.Content>
				<Modal.Actions>
					<Button color="red" onClick={() => setOpen( false )}>
						Annuler
					</Button>
					<Button content="Rejoindre" labelPosition="right" icon="checkmark" onClick={submitHandler} positive />
				</Modal.Actions>
			</Modal>
			<Modal onClose={() => setOpenAction( false )} onOpen={() => setOpenAction( true )} open={openAction}>
				<Modal.Header>Erreur</Modal.Header>
				<Modal.Content>
					<Header textAlign="center">Désolé, le mot de passe est incorrect...</Header>
					<img style={{ paddingLeft: '38%' }} src={snifGif} alt="error" />
					<Header textAlign="center">Veuillez réessayer !</Header>
				</Modal.Content>
				<Modal.Actions>
					<Button color="red" onClick={() => setOpenAction( false )}>
						Annuler
					</Button>
				</Modal.Actions>
			</Modal>
			<Comment className="chatChannel" style={style} onClick={handleClick}>
				<Comment.Content>
					<Comment.Text>{props.channelName !== '' ? props.channelName : 'No name'}</Comment.Text>
				</Comment.Content>
			</Comment>
		</>
	);
}
