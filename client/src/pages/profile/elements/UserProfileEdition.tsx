import { useContext, useEffect, useRef, useState } from 'react';
import { Grid, Icon, Popup } from 'semantic-ui-react';
import ScreenTransitions from '../../../components/screenTransitions';
import Segments from '../../../components/segments';
import Text from '../../../components/text';

import './UserProfileEdition.css';
import { AuthContext } from '../../../contexts/authContext';
import { IUserProfile } from '../../../interfaces/userProfileInterface';
import { getUserProfile, postCustomAvatar, postUserEdit } from '../../../requests/profileRequests';
import { useNavigate } from 'react-router-dom';
import { switchBool } from '../../../globals/utils';
import { AvatarSelectionTab } from '../../../elements/AvatarSelectionTab';
import Buttons from '../../../components/buttons';
import { IProfileSettings } from '../../../interfaces/profileSettingsInterface';
import { APP_CUSTOM_UPLOAD_NAME, APP_PROFILE_PATH, BUTTON_LOADING_NAME, SEMANTIC_ICON_LOADING } from '../../../globals/constants';
import { UsernameInput } from '../../../elements/UsernameInput';
import { useKeyPress } from '../../../hooks/useKeyPress';
import { NotifContext } from '../../../contexts/notifContext';

export function UserProfileEdition(): JSX.Element {
	//? HOOKS
	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );
	const authContext = useContext( AuthContext );
	const notifContext = useContext( NotifContext );
	const navigate = useNavigate();
	const [ userProfile, setUserProfile ] = useState<IUserProfile | undefined>( undefined );
	// Settings
	const [ newName, setNewName ] = useState<string>( '' );
	const [ newNamePlaceholder, setNewNamePlaceholder ] = useState<string>( '' );
	const [ newTwoFa, setNewTwoFa ] = useState<boolean>( false );
	const [ newAvatarUrl, setNewAvatarUrl ] = useState<string>( '' );
	const [ newUserCustomAvatar, setNewUserCustomAvatar ] = useState<File | undefined>( undefined );
	// Upload
	const [ isNameAvailable, setIsNameAvailable ] = useState<boolean>( false );
	const [ isValidationLoading, setIsValidationLoading ] = useState<boolean>( false );
	// Keyboard
	const pressEnter = useKeyPress( 'Enter' );

	//* On mount/unmount
	useEffect( () => {
		getUserProfile( authContext.login ).then( ( response ) => {
			if ( !mounted.current )
				return;

			if ( response ) {
				setNewName( response.name );
				setNewNamePlaceholder( response.name );
				setNewTwoFa( response.isTwoFa );
				setNewAvatarUrl( response.avatarUrl );
				setUserProfile( response );
			} else {
				authContext.doLogout();
				navigate( '/error' );
			}
		} );
	}, [] );

	//* On Enter press
	useEffect( () => {
		if ( pressEnter )
			updateUserProfile();
	}, [ pressEnter ] );

	//? ACTIONS

	const cancelUpload = (): void => {
		setIsValidationLoading( false );
		//TODO Popup or something to show it failed
	};

	/**
	 * updateUserProfile()
	 * Send the edited user profile to the server
	 */
	const updateUserProfile = async (): Promise<void> => {
		if ( isNameAvailable && userProfile ) {
			setIsValidationLoading( true );

			// Upload the user
			const profileSettings: IProfileSettings = {
				login: userProfile.login,
				name: newName,
				isTwoFa: newTwoFa,
				avatarUrl: newAvatarUrl,
			};

			if ( ( await postUserEdit( profileSettings ) ) !== 201 )
				return cancelUpload();
			// If we need, upload avatar
			if ( newAvatarUrl === APP_CUSTOM_UPLOAD_NAME && newUserCustomAvatar )
				if ( ( await postCustomAvatar( newUserCustomAvatar ) ) !== 201 )
					return cancelUpload();

			// Validate and navigate
			// await sleep( rand( 1000, 1300 ) ); // Proof of work
			authContext.reload();
			notifContext.postNotif( {
				type: 'success',
				title: 'Profil mis a jour !',
				content: 'Je vous laisse explorer votre nouveau vous..',
			} );
			navigate( APP_PROFILE_PATH );
		}
	};

	return !userProfile || newTwoFa === undefined ? (
		<ScreenTransitions.Loading />
	) : (
		<Segments.BackgroundWhite>
			{/* TOP TEXT AND LINK */}
			<Text.PageSubtitle>{userProfile.login + ' est mort, vive ' + userProfile.login + '!'}</Text.PageSubtitle>
			<br />
			<Buttons.ReturnLink href={APP_PROFILE_PATH} />

			<Grid centered style={{ margin: '50px' }}>
				<Grid.Row>
					{/* NAME */}
					<Grid.Column width={10}>
						{/* <Input label='Name' value={ newName } fluid onChange={ event => setNewName( event.target.value ) } /> */}
						<UsernameInput
							value={newName}
							setValue={setNewName}
							placeholder={newNamePlaceholder}
							setPlaceholder={setNewNamePlaceholder}
							setIsNameAvailable={setIsNameAvailable}
							login={authContext.login}
							currentName={userProfile.name}
							label="Name"
						/>
					</Grid.Column>
					{/* 2FA */}
					<Grid.Column width={6}>
						<Text.Paragraph>
							<Popup
								inverted
								size="tiny"
								position="top center"
								trigger={<Icon size="large" className="pointer" name={newTwoFa ? 'toggle on' : 'toggle off'} onClick={() => setNewTwoFa( switchBool( newTwoFa ) )} />}
								content={newTwoFa ? 'Disable 2FA' : 'Enable 2FA'}
							/>
							Two Factors Authentiaction
						</Text.Paragraph>
					</Grid.Column>
				</Grid.Row>
				<Grid.Row>
					{/* AVATARS */}
					<AvatarSelectionTab className="profile-edition-avatars" curentAvatar={userProfile.avatarUrl} setAvatarUrl={setNewAvatarUrl} setCustomFile={setNewUserCustomAvatar} />
				</Grid.Row>
				{/* SEND */}
				<Grid.Row>
					<Grid.Column></Grid.Column>
					<Grid.Column floated="right" width={4}>
						<Buttons.Confirm
							name={!isValidationLoading ? 'Valider' : BUTTON_LOADING_NAME}
							icon={!isValidationLoading ? 'check' : SEMANTIC_ICON_LOADING}
							onClick={updateUserProfile}
							disabled={!isNameAvailable}
						/>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</Segments.BackgroundWhite>
	);
}
