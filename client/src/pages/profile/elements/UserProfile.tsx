import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grid, Icon, Popup } from 'semantic-ui-react';

import './UserProfile.css';
import ScreenTransitions from '../../../components/screenTransitions';
import Segments from '../../../components/segments';
import Text from '../../../components/text';
import { AuthContext } from '../../../contexts/authContext';
import { IUserProfile } from '../../../interfaces/userProfileInterface';
import { getUserProfile } from '../../../requests/profileRequests';
import { ProfileCard } from '../../../components/ProfileCard';
import { APP_ERROR_PATH, APP_USER_EDITION_PATH } from '../../../globals/constants';
import { FriendsModal } from './FriendsModal';
import { DeleteProfileModal } from './DeleteProfileModal';

export function UserProfile(): JSX.Element {
	//? HOOKS
	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );

	const navigate = useNavigate();
	const authContext = useContext( AuthContext );
	const [ userProfile, setUserProfile ] = useState<IUserProfile | undefined>( undefined );

	//* On mount
	useEffect( () => {
		getUserProfile( authContext.login ).then( ( response ) => {
			if ( !mounted.current )
				return;

			if ( response )
				setUserProfile( response );
			else {
				authContext.doLogout(); //?
				navigate( APP_ERROR_PATH );
			}
		} );
	}, [] );

	return !userProfile ? (
		<ScreenTransitions.Loading />
	) : (
		<Segments.BackgroundWhite>
			{/* HEADER */}
			<Grid>
				<Grid.Column width={14}>
					<Text.PageSubtitle>{'Salut à toi ' + userProfile.login + ' !'}</Text.PageSubtitle>
				</Grid.Column>
				{/* PENDING INVITES */}
				<Grid.Column width={1}>
					<FriendsModal userLogin={authContext.login} />
				</Grid.Column>
				{/* EDIT PROFILE */}
				<Grid.Column width={1}>
					<Popup
						position="top center"
						size="tiny"
						trigger={
							<Link to={APP_USER_EDITION_PATH}>
								<Icon name="edit outline" size="big" />
							</Link>
						}
						content="Editer le profil"
					/>
				</Grid.Column>
				{/* DELETE PROFILE */}
				{/*//! deprec */}
				{/* <Grid.Column width={1}>
					<DeleteProfileModal userLogin={authContext.login} doLogout={authContext.doLogout} />
				</Grid.Column> */}
			</Grid>

			{/* PROFILE CARD */}
			<Grid centered>
				<ProfileCard basic margin="50px" size="big" userData={userProfile} />
			</Grid>

			{/* TEXT */}
			<Text.Paragraph>{userProfile.isTwoFa ? 'You have enabled Two-Factor Authentication' : 'Two-Factor Authentication is disabled'}</Text.Paragraph>
		</Segments.BackgroundWhite>
	);
}
