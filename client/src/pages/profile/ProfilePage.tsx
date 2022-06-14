import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Containers from '../../components/containers';
import ScreenTransitions from '../../components/screenTransitions';
import { APP_USER_CREATION_QUERY, APP_USER_EDITION_QUERY } from '../../globals/constants';
import { UserCreationTabs } from './elements/UserCreationTabs';
import { UserProfile } from './elements/UserProfile';
import { UserProfileEdition } from './elements/UserProfileEdition';

export function ProfilePage(): JSX.Element {
	//? HOOKS
	// Warning Unconventional use of search ( it is compared with plain string and do not use new URLSearchParam ... )
	const search = useLocation().search;
	const [ isPageLoaded, setIsPageLoaded ] = useState<boolean>( false );
	const [ ProfileVue, setProfileVue ] = useState<JSX.Element>( <></> );

	//* On profileVue change
	useEffect( () => {
		if ( ProfileVue !== <></> )
			setIsPageLoaded( true );
	}, [ ProfileVue ] );

	//* On location changes
	useEffect( () => {
		if ( search === APP_USER_CREATION_QUERY ) {
			setProfileVue( <UserCreationTabs /> );
		} else if ( search === APP_USER_EDITION_QUERY ) {
			setProfileVue( <UserProfileEdition /> );
		} else {
			setProfileVue( <UserProfile /> );
		}
	}, [ search ] );

	return !isPageLoaded ? (
		<ScreenTransitions.Loading />
	) : (
		<Containers.NoScroll>
			<Containers.Page>{ProfileVue}</Containers.Page>
		</Containers.NoScroll>
	);
}
