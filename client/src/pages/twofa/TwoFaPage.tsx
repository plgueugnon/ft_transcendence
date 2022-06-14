import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GridColumn, Input } from 'semantic-ui-react';

import Buttons from '../../components/buttons';
import Containers from '../../components/containers';
import Segments from '../../components/segments';
import Text from '../../components/text';
import { AuthContext } from '../../contexts/authContext';
import { APP_PROFILE_PATH, APP_TMP_COOKIE_NAME, TWOFA_CODE_LENGTH } from '../../globals/constants';
import { ILoginSuccess } from '../../interfaces/loginSuccessInterface';
import { sendTwoFaCode } from '../../requests/loginRequests';

export function TwoFaPage(): JSX.Element {
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
	const [ value, setValue ] = useState<string>( '' );
	const [ isSending, setIsSending ] = useState<boolean>( false );
	const [ inputDisabled, setInputDisabled ] = useState<boolean>( false );
	const [ inputMessage, setInputMessage ] = useState<string>( '' );
	const [ inputStatus, setInputStatus ] = useState<'none' | 'sending' | 'error'>( 'none' );
	const [ login, setLogin ] = useState<string>( '' );
	// React
	const authContext = useContext( AuthContext );
	const navigate = useNavigate();

	//* On inputStatus change
	useEffect( () => {
		switch ( inputStatus ) {
			case 'none':
				setIsSending( false );
				setInputDisabled( false );
				setInputMessage( "le code c'est le code" );
				break;
			case 'sending':
				setIsSending( true );
				setInputDisabled( true );
				setInputMessage( 'chargement...' );
				break;
			case 'error':
				setIsSending( false );
				setInputDisabled( false );
				setInputMessage( 'le code ne correspond pas.' );
				break;
		}
	}, [ inputStatus ] );

	//* On mount
	useEffect( () => {
		const storedItem = localStorage.getItem( APP_TMP_COOKIE_NAME );
		if ( !storedItem ) {
			navigate( '/' );
			return;
		}

		// If cookie
		const storedData = JSON.parse( storedItem );
		setLogin( storedData.login );

		// Go to home when 2FA expiration (1min before)
		const expDate = new Date( storedData.expirationDate );
		const timeout = setTimeout( () => window.location.replace( '/' ), expDate.getTime() - new Date().getTime() - 1000 * 60 );
		return () => {
			clearTimeout( timeout );
			localStorage.removeItem( APP_TMP_COOKIE_NAME );
		};
	}, [] );

	//? ACTIONS
	const handle6Digits = async ( code: string ) => {
		setInputStatus( 'sending' );
		// make sure the code is 6digits long
		code = code.substring( 0, TWOFA_CODE_LENGTH );
		const loginSuccess: ILoginSuccess | undefined = await sendTwoFaCode( login, code );

		// Login then redirect to profile
		if ( loginSuccess ) {
			await authContext.doLogin( loginSuccess.apiToken, loginSuccess.login, new Date( loginSuccess.expirationDate ) );
			navigate( APP_PROFILE_PATH );
		} else
			setInputStatus( 'error' );
	};

	return (
		<Containers.Page>
			<Buttons.ReturnLink href="/" />
			<Containers.Centered>
				<Text.PageSubtitle className="forest">2FA</Text.PageSubtitle>
				<Segments.BackgroundWhite>
					<GridColumn textAlign="center">
						Bonjour, entrez le code reçu par mail.
						<div className={inputStatus === 'error' ? 'red' : ''}>
							<br />
							<br />
							<Input
								loading={isSending}
								disabled={inputDisabled}
								icon="lock"
								placeholder="XXXXXX"
								value={value}
								error={inputStatus === 'error'}
								onChange={( event ) => {
									if ( event.target.value.length <= TWOFA_CODE_LENGTH ) {
										setValue( event.target.value );
										if ( event.target.value.length === TWOFA_CODE_LENGTH )
											handle6Digits( event.target.value );
									}
								}}
							/>
							<br />
							<br />
							{inputMessage}
						</div>
					</GridColumn>
				</Segments.BackgroundWhite>
			</Containers.Centered>
		</Containers.Page>
	);
}
