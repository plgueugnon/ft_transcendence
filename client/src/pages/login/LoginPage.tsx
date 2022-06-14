import { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Buttons from '../../components/buttons';

import Containers from '../../components/containers';
import { LoginMessage, ELoginStatus } from '../../elements/LoginMessage';
import { APP_2FA_PATH, APP_PROFILE_PATH, APP_TMP_COOKIE_NAME, RAN_OAUTH_STATE, ACTION_TAG_INVITE_FROM_CHAT } from '../../globals/constants';
import { rand, sleep } from '../../globals/utils';
import { getAccessToken } from '../../requests/loginRequests';
import { AuthContext } from '../../contexts/authContext';
import ScreenTransitions from '../../components/screenTransitions';
import { NotifContext } from '../../contexts/notifContext';

export function LoginPage(): JSX.Element {
	//? HOOKS
	// Mounted
	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );
	const [ loginStatus, setLoginStatus ] = useState<ELoginStatus | undefined>( undefined );
	// React
	const search = useLocation().search;
	const navigate = useNavigate();
	const authContext = useContext( AuthContext );
	const notifContext = useContext( NotifContext );

	//? ACTIONS
	/**
	 * setDelayedLoginStatus()
	 * @param status status to be set
	 * Set status but only after a short proof of work sleep
	 */
	const setDelayedLoginStatus = ( status: ELoginStatus ) => {
		// Proof of work
		sleep( rand( 600, 1000 ) ).then( () => {
			setLoginStatus( status );
		} );
	};

	/**
	 * delayedNavigate()
	 * @param uri to redirect
	 * Navigate to uri after short proof of work sleep
	 */
	const delayedNavigate = ( uri: string ) => {
		// Proof of work
		sleep( rand( 400, 600 ) ).then( () => {
			navigate( uri );
		} );
	};

	//* On mount
	useEffect( () => {
		// Must be used to track oauth with windowOAuthPopup(), check wether we are still in the popup or redirected
		if ( new URLSearchParams( search ).get( 'redirected' ) )
		{
			setLoginStatus( ELoginStatus.BeforeLogin );

			const oauthState = new URLSearchParams( search ).get( 'state' );
			// Check if state is valid
			if ( oauthState !== RAN_OAUTH_STATE ) {
				setDelayedLoginStatus( ELoginStatus.StateCheckFailure );
				return;
			}

			const oauthCode = new URLSearchParams( search ).get( 'code' );
			// if code does not exists
			if ( !oauthCode ) {
				setDelayedLoginStatus( ELoginStatus.NoCodeReceived );
				return;
			}

			// Get the server access token using the reedemed 42 code
			// This triggers user creation in DB (server side)
			// Sleep to make sure that server wrote new user and will send
			getAccessToken( oauthCode ).then( ( loginSuccess ) =>
				sleep( 1000 ).then( () => {
					if ( !mounted.current )
						return;

					if ( loginSuccess ) {
						// If user need to 2FA, store login in local storage
						if ( loginSuccess.twoFa ) {
							// Set tmp cookie token for 2FA
							localStorage.setItem(
								APP_TMP_COOKIE_NAME,
								JSON.stringify( {
									login: loginSuccess.login,
									expirationDate: new Date( loginSuccess.expirationDate ).toISOString(),
								} )
							);
							window.location.replace( APP_2FA_PATH );
						}
						// User is logged
						else {
							notifContext.postNotif( {
								type: 'success',
								title: 'Bonjour ' + loginSuccess.login + ' !',
								content: 'Vous êtes bien connecté, je vous souhaite un agréable saumonnage.',
							} );
							authContext.doLogin( loginSuccess.apiToken, loginSuccess.login, new Date( loginSuccess.expirationDate ), APP_PROFILE_PATH );
						}
					} else {
						setDelayedLoginStatus( ELoginStatus.UndefinedIssue );
					}
				} )
			);
		}
		// If the login page is opened in the popup (or wherever without the redirected flag)
		else {
			sleep( 2000 ).then( () => {
				window.location.replace( '/' );
			} );
		}

		// Timeout error (after 15s)
		sleep( 15000 ).then( () => {
			if ( loginStatus === ELoginStatus.BeforeLogin )
				setLoginStatus( ELoginStatus.Timeout );
		} );
	}, [] );

	//? RENDER
	return loginStatus === undefined ? (
		<ScreenTransitions.Loading />
	) : (
		<Containers.NoScroll>
			<Containers.Page>
				<Buttons.ReturnHref href="/" />

				<Containers.Centered>
					<LoginMessage status={loginStatus} />
				</Containers.Centered>
			</Containers.Page>
		</Containers.NoScroll>
	);
}
