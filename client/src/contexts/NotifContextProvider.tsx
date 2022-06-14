import { useEffect, useState } from 'react';
import Messages from '../components/messages';
import Message from '../components/messages';
import { IChildrenProps, INotif } from '../globals/interfaces';

import { NotifContext } from './notifContext';

export function NotifContextProvider( props: IChildrenProps ): JSX.Element {
	//? HOOKS
	const [ messages, setMessages ] = useState<INotif[]>( [] );

	//? STYLE

	const wrapperStyle = {
		width: '550px',
		top: '75px',
		right: '30px',
		zIndex: 15,
	};

	//? ACTIONS

	const postNotif = ( newMessage: INotif ) => {
		newMessage.createdAt = new Date().getTime();

		let newMessages: INotif[] = [ ...messages ];
		newMessages.push( newMessage );
		setMessages( newMessages );

		// Set auto clear timeout
		// setTimeout( () => clickOnDismiss( id ), MESSAGES_LIFETIME + ANIMATION_DURATION );
	};

	const clickOnDismiss = async ( id: number ) => {
		// messages.forEach( ( message, index ) => {
		// 	if ( id === message.id )
		// 		handleDismiss( index );
		// } );
	};

	const cleanNotifs = () => {
		setMessages( [] );
	};

	//? CONTENT

	const ANIMATION_DURATION = 150;

	//? RENDER

	return (
		<NotifContext.Provider
			value={{
				notifs: messages,
				postNotif: postNotif,
				cleanNotifs: cleanNotifs,
			}}
		>
			<div style={wrapperStyle} className="fixed">
				{messages.map( ( message: INotif, index: number ) => (
					<Messages.PopUp
						message={message}
						// onClick={ () => clickOnDismiss( index ) }
						createdAt={message.createdAt ? message.createdAt : new Date().getTime()}
						animationDuration={ANIMATION_DURATION}
						key={index}
					/>
				) )}
			</div>
			{props.children}
		</NotifContext.Provider>
	);
}
