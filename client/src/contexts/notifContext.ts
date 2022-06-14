import React from 'react';
import { INotif } from '../globals/interfaces';

interface INotifContext {
	notifs: INotif[];
	postNotif: ( Notif: INotif ) => void;
	cleanNotifs: () => void;
}

export const NotifContext = React.createContext<INotifContext>( {
	notifs: [],
	postNotif: ( notif: INotif ) => { },
	cleanNotifs: () => { },
} );
