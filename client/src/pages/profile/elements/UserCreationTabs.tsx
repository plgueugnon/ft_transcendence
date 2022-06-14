import { useContext, useState } from 'react';
import { Grid, GridColumn } from 'semantic-ui-react';

import './UserCreationTabs.css';
import Segments from '../../../components/segments';
import Text from '../../../components/text';
import Tabs, { ITab } from '../../../components/tabs';
import { AuthContext } from '../../../contexts/authContext';
import { APP_CUSTOM_UPLOAD_NAME, BUTTON_LOADING_NAME, SEMANTIC_ICON_LOADING } from '../../../globals/constants';
import { AvatarSelectionTab } from '../../../elements/AvatarSelectionTab';
import { rand, sleep } from '../../../globals/utils';
import { IProfileSettings } from '../../../interfaces/profileSettingsInterface';
import { postCustomAvatar, postUserEdit } from '../../../requests/profileRequests';
import Buttons from '../../../components/buttons';
import { UsernameInput } from '../../../elements/UsernameInput';

export function UserCreationTabs(): JSX.Element {
	//? HOOKS
	// const	navigate = useNavigate();
	const authContext = useContext( AuthContext );
	const [ userName, setUserName ] = useState<string>( '' );
	const [ isNameAvailable, setIsNameAvailable ] = useState<boolean>( false );
	const [ userNamePlaceholder, setUserNamePlaceHolder ] = useState<string>( '' );
	const [ userAvatarUrl, setUserAvatarUrl ] = useState<string>( '' );
	const [ userCustomAvatar, setUserCustomAvatar ] = useState<File | undefined>( undefined );
	// Upload
	const [ isValidationLoading, setIsValidationLoading ] = useState<boolean>( false );

	//? ACTIONS

	const cancelUpload = (): void => {
		setIsValidationLoading( false );
		//TODO Popup or something to show it failed
	};

	const handleValidationClick = async () => {
		// If name took or already loading or avatar not selected
		if ( !isNameAvailable || userAvatarUrl === '' || isValidationLoading ) return;

		setIsValidationLoading( true );

		// Upload the user
		const profileSettings: IProfileSettings = {
			login: authContext.login,
			name: userName,
			isTwoFa: false,
			avatarUrl: userAvatarUrl,
		};

		if ( ( await postUserEdit( profileSettings ) ) !== 201 )
			return cancelUpload();
		// If we need, upload avatar
		if ( userAvatarUrl === APP_CUSTOM_UPLOAD_NAME && userCustomAvatar )
			if ( ( await postCustomAvatar( userCustomAvatar ) ) !== 201 )
				return cancelUpload();

		// Validate and navigate
		await sleep( rand( 400, 600 ) );
		window.location.replace( '/jouer' );
	};

	//? RENDER

	const userCreationTabs: ITab[] = [
		{
			content: (
				<>
					<Text.FormSubtitle>Comment voulez vous vous appeler ?</Text.FormSubtitle>
					<br />
					<br />
					<UsernameInput
						value={userName}
						setValue={setUserName}
						placeholder={userNamePlaceholder}
						setPlaceholder={setUserNamePlaceHolder}
						setIsNameAvailable={setIsNameAvailable}
						login={authContext.login}
						currentName={authContext.username}
					/>
				</>
			),
			onEnter: () => { },
			onLeave: () => {
				if ( userName === '' )
					setUserName( userNamePlaceholder );
			},
		},
		{
			content: (
				<>
					<Text.FormSubtitle>Sélectionnez votre avatar</Text.FormSubtitle>
					<br />
					<br />
					<br />
					<AvatarSelectionTab setAvatarUrl={setUserAvatarUrl} setCustomFile={setUserCustomAvatar} />
					<Grid>
						<Grid.Row>
							<Grid.Column></Grid.Column>
							<Grid.Column floated="right" width={4}>
								{
									// userAvatarUrl !== ''
									// ?
									<Buttons.Confirm
										name={!isValidationLoading ? 'Valider' : BUTTON_LOADING_NAME}
										icon={!isValidationLoading ? 'check' : SEMANTIC_ICON_LOADING}
										onClick={() => handleValidationClick()}
										disabled={!isNameAvailable || userAvatarUrl === '' || isValidationLoading}
									/>
									// :
									// 	<></>
								}
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</>
			),
			onEnter: () => { },
			onLeave: () => { },
		},
	];

	return (
		<Segments.BackgroundWhite>
			<Text.FormTitle>{'Bienvenue ' + ( userName ? userName + ' ' : '' ) + '!'}</Text.FormTitle>

			<Grid textAlign="center" style={{ height: '40vh' }} verticalAlign="middle">
				<GridColumn>
					{/* TABS CONTROLLER */}
					<Tabs.Controller tabs={userCreationTabs} onValidate={handleValidationClick} />
				</GridColumn>
			</Grid>
		</Segments.BackgroundWhite>
	);
}
