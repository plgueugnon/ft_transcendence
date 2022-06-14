import React from 'react';

export interface IRouteTracker {
	gameID: string;
	setGameID: Function;
}

export const RouteTrackerContext = React.createContext<IRouteTracker>( {
	gameID: '',
	setGameID: () => { },
} );
