import { useEffect, useRef, useState } from 'react';
import { Message } from 'semantic-ui-react';
import { MESSAGES_LIFETIME } from '../globals/constants';
import { INotif } from '../globals/interfaces';
import { sleep } from '../globals/utils';
import Transitions from './transitions';

namespace Messages {
	interface IPopUpProps {
		message: INotif;
		animationDuration: number;
		createdAt: number;
		onClick?: Function;
	}

	export function PopUp( props: IPopUpProps ): JSX.Element {
		//? HOOKS

		// Mounted
		const mounted = useRef( false );
		//* On mount
		useEffect( () => {
			mounted.current = true;
			return () => {
				mounted.current = false;
			};
		}, [] );
		// State
		const [ isHidden, setIsHidden ] = useState<boolean>( false );
		const [ animationTrigger, setAnimationTrigger ] = useState<boolean>( false );

		//* On mount
		useEffect( () => {
			setAnimationTrigger( true );

			if ( props.createdAt + MESSAGES_LIFETIME - new Date().getTime() > 0 ) {
				setTimeout( () => {
					handleDismiss();
				}, props.createdAt + MESSAGES_LIFETIME - new Date().getTime() );
			}
		}, [] );

		//? STYLE

		const messageStyle = {
			marginBottom: '15px',
		};

		//? ACTIONS

		const handleDismiss = async () => {
			if ( !mounted.current || isHidden )
				return;

			setAnimationTrigger( false );

			await sleep( props.animationDuration );

			setIsHidden( true );
		};

		return (
			<Transitions.FadeLeft duration={props.animationDuration} visible={animationTrigger}>
				<Message
					style={messageStyle}
					// Type
					info={props.message.type === 'info'}
					warning={props.message.type === 'warning'}
					error={props.message.type === 'error'}
					success={props.message.type === 'success'}
					hidden={isHidden}
					// Actions
					onDismiss={() => handleDismiss()}
					onClick={() => ( props.onClick ? props.onClick() : undefined )}
					// Content
					header={props.message.title}
					content={props.message.content}
				>
					{/* <Message.Header>
						{ props.message.title }
					</Message.Header>
					<p>
						{ props.message.content }
					</p> */}
				</Message>
			</Transitions.FadeLeft>
		);
	}
}

export default Messages;
