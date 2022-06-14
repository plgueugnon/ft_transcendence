import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Containers from '../../components/containers';
import Lists from '../../components/lists';
import ScreenTransitions from '../../components/screenTransitions';
import Segments from '../../components/segments';
import Text from '../../components/text';
import { APP_USER_SEARCH_PATH } from '../../globals/constants';
import { IUsersPublic } from '../../interfaces/usersPublicInterface';
import { getUsersInfos } from '../../requests/usersRequests';

export function UsersSearchPage(): JSX.Element {
	//? HOOKS

	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );
	// Data
	const [ searchQuery, setSearchQuery ] = useState<string | null>( null );
	const [ allUsers, setAllUsers ] = useState<IUsersPublic[] | undefined>( undefined );
	const [ displayedUsers, setDisplayedUsers ] = useState<IUsersPublic[] | undefined>( undefined );
	// Navigation
	const search = useLocation().search;
	// const navigate = useNavigate();

	//* On search change
	useEffect( () => {
		const newSearchQuery: string | null = new URLSearchParams( search ).get( 'search' );
		setSearchQuery( newSearchQuery );
	}, [ search, allUsers ] );

	//* On searchQuery OR allUsers change
	useEffect( () => {
		const upperSearch = searchQuery?.toUpperCase();

		if ( !upperSearch && allUsers )
			setDisplayedUsers( allUsers );
		else if ( upperSearch && allUsers )
			setDisplayedUsers( allUsers.filter( ( element ) => element.name.toUpperCase().includes( upperSearch ) || element.login.toUpperCase().includes( upperSearch ) ) );
		else
			setDisplayedUsers( undefined );
	}, [ searchQuery, allUsers ] );

	//* On mount
	useEffect( () => {
		getUsersInfos().then( ( response: IUsersPublic[] | undefined ) => {
			if ( !mounted.current )
				return;

			setAllUsers( response );
		} );
	}, [] );

	return displayedUsers === undefined ? (
		<ScreenTransitions.Loading />
	) : (
		<Containers.Page>
			<Text.PageSubtitle className="forest">{!searchQuery || searchQuery === '' ? 'Résultats' : 'Résultats pour: ' + searchQuery}</Text.PageSubtitle>
			<Segments.BackgroundWhite>
				<Lists.Users selection>
					{displayedUsers.map( ( element, index ) => (
						<Lists.User userSearchPath={APP_USER_SEARCH_PATH} login={element.login} name={element.name} avatarUrl={element.avatarUrl} key={index} />
					) )}
				</Lists.Users>
			</Segments.BackgroundWhite>
		</Containers.Page>
	);
}
