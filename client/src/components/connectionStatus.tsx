import { Table, Popup } from 'semantic-ui-react';
import offlineIcon from '../images/fishbone-svgrepo-com.svg';
import onlineIcon from '../images/little-fish-svgrepo-com.svg';
import watching from '../images/watchingFish.png';
import inGameGif from '../images/fishing-pole.gif';

const offlineIconStyle = {
	height: '40px',
	width: '40px',
	filter: 'invert(24%) sepia(73%) saturate(1543%) hue-rotate(307deg) brightness(93%) contrast(91%)',
};

const onlineIconStyle = {
	height: '40px',
	width: '40px',
	filter: 'invert(23%) sepia(40%) saturate(2902%) hue-rotate(129deg) brightness(99%) contrast(99%)',
};

const otherIconStyle = {
	height: '40px',
	width: '40px',
};

const adjustPaddingStyle = {
	paddingTop: '0em',
	paddingBottom: '0px',
	paddingLeft: '0em',
};

// * display users status online / offline / in game
export function displayUserStatus( user: string, userConnectStatus: { login: string; status: string }[] ) {
	let userStatus: { login: string; status: string } | undefined;
	userStatus = userConnectStatus.find( ( props ) => props.login === user );
	if ( userStatus === undefined ) {
		return (
			<Table.Cell style={adjustPaddingStyle}>
				<Popup wide
					trigger={
						<i className="icon">
							<img src={offlineIcon} style={offlineIconStyle} alt='offline'></img>
						</i>}
					content='offline'
					position="top center"
				/>
			</Table.Cell>
		);
	}
	// else
	else if ( userStatus.status === 'online' ) {
		return (
			<Table.Cell style={adjustPaddingStyle}>
				<Popup wide
					trigger={
						<i className="icon">
							<img src={onlineIcon} style={onlineIconStyle} alt='online'></img>
						</i>}
					content='online'
					position="top center"
				/>
			</Table.Cell>
		);
	}
	else if ( userStatus.status === 'Playing' ) {
		return (
			<Table.Cell style={adjustPaddingStyle}>
				<Popup wide
					trigger={
						<i className="icon">
							<img src={inGameGif} style={otherIconStyle} alt='Playing'></img>
						</i>}
					content='Playing'
					position="top center"
				/>
			</Table.Cell>
		);
	}
	else if ( userStatus.status === 'Watching' ) {
		return (
			<Table.Cell style={adjustPaddingStyle}>
				<Popup wide
					trigger={
						<i className="icon">
							<img src={watching} style={otherIconStyle} alt='Watching'></img>
						</i>}
					content='Watching'
					position="top center"
				/>
			</Table.Cell>
		);
	}
}
