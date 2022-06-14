import { useEffect, useRef, useState } from 'react';
import { Container, Header, Image, Table } from 'semantic-ui-react';
import Containers from '../../components/containers';
import Text from '../../components/text';
import defaultAvatar from '../../images/TheSalmond.png';
import { getUsersInfos } from '../../requests/usersRequests';
import ScreenTransitions from '../../components/screenTransitions';
import { APP_USER_SEARCH_PATH } from '../../globals/constants';
import { useNavigate } from 'react-router-dom';

interface ItableHeader {
	hTitle: string;
}

interface ItableRowContent {
	rank: number;
	playerModel: { avatarURI?: string; login: string; name: string };
	score: number;
}

export function LeaderboardPage(): JSX.Element {
	//? HOOKS
	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );
	// Navigation
	const navigate = useNavigate();

	const [ publicUsersScore, setPublicUsersScore ] = useState<ItableRowContent[] | undefined>( undefined );

	const scoreHead: ItableHeader[] = [ { hTitle: 'Rank' }, { hTitle: 'Player' }, { hTitle: 'Score' } ];
	let scoreData: ItableRowContent[] = [];

	useEffect( () => {
		getUsersInfos().then( ( publicUsersData ) => {
			if ( !mounted.current )
				return;

			if ( publicUsersData ) {
				//! const newScore: ItableRowContent = {rank: 0, playerModel: { avatarURI: '', name: '', login: '' }, score: 0};
				// newScore is edited by the loop each time, plus it is const so it may badly handle changes
				for ( let i = 0; i < publicUsersData.length; i++ ) {
					let newScore: ItableRowContent = { rank: 0, playerModel: { avatarURI: '', name: '', login: '' }, score: 0 };
					// * En principe default avatar et check lors login devrait rendre ce check inutile
					newScore.playerModel.avatarURI = publicUsersData[ i ].avatarUrl === null ? defaultAvatar : publicUsersData[ i ].avatarUrl;
					// *
					newScore.playerModel.name = publicUsersData[ i ].name;
					newScore.playerModel.login = publicUsersData[ i ].login;
					newScore.score = publicUsersData[ i ].nbOfLoses > publicUsersData[ i ].nbOfWins ? 0 : publicUsersData[ i ].nbOfWins - publicUsersData[ i ].nbOfLoses;
					scoreData.push( newScore );
				}
				scoreData.sort( ( firstItem, secondItem ) => secondItem.score - firstItem.score );
				for ( let i = 0; i < scoreData.length; i++ ) scoreData[ i ].rank = i + 1;
				setPublicUsersScore( scoreData );
			}
		} );
	}, [] );

	const THeadItem = ( props: string ) => {
		return (
			<Table.HeaderCell textAlign="center" key={props}>
				{props}
			</Table.HeaderCell>
		);
	};

	const TRowItem = ( props: ItableRowContent ) => {
		return (
			<Table.Row onClick={() => navigate( APP_USER_SEARCH_PATH + '/' + props.playerModel.login + '#leaderboard' )}>
				<Table.Cell textAlign="center">{props.rank}</Table.Cell>
				<Table.Cell>
					<Header as="h4" image>
						<Image src={props.playerModel.avatarURI ? props.playerModel.avatarURI : defaultAvatar} rounded size="mini" />
						<Header.Content>{props.playerModel.name}</Header.Content>
					</Header>
				</Table.Cell>
				<Table.Cell textAlign="center">{props.score}</Table.Cell>
			</Table.Row>
		);
	};

	const DisplayTable = ( scoreHead: ItableHeader[], scoreData: ItableRowContent[] ) => {
		return (
			<Table celled selectable className="pointer" style={{ borderRightColor: '#F0B5A4', borderRightWidth: '2px', borderLeftColor: '#F0B5A4', borderLeftWidth: '2px' }}>
				<Table.Header>
					<Table.Row>
						{scoreHead.map( ( h ) => {
							return THeadItem( h.hTitle );
						} )}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{scoreData.map( ( h, index ) => {
						return <TRowItem rank={h.rank} playerModel={h.playerModel} score={h.score} key={index} />;
					} )}
				</Table.Body>
			</Table>
		);
	};

	return publicUsersScore === undefined ? (
		<ScreenTransitions.Loading />
	) : (
		<div>
			<Containers.Page>
				<Container textAlign="center">
					<Text.PageSubtitle className="forest">The fish-tastics !</Text.PageSubtitle>
				</Container>
				{DisplayTable( scoreHead, publicUsersScore )}
			</Containers.Page>
		</div>
	);
}
