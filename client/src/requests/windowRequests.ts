import { APP_LOGIN_REDIRECT_URL, FRONT_URL, FT_API_UID, FT_API_URL, RAN_OAUTH_STATE } from '../globals/constants';

/**
 * windowOAuthPopup()
 * Use React Router useNavigate route. This allows us to use randomly generated state keys ex: RAN_OAUTH_STATE
 * Pop a window asking for 42 login. Resend navigation to main window once login is done. Cancel when popup is closed.
 */
export function windowOAuthPopup( onLoginSuccess: Function, onPopupClose: Function ) {
	const popupParams: string = 'width=500px,height=750px,left=100,top=100';
	let winPopup: any;

	const requestUri: string =
		FT_API_URL + '/oauth/authorize' + '?client_id=' + FT_API_UID + '&response_type=code' + '&state=' + RAN_OAUTH_STATE + '&redirect_uri=' + APP_LOGIN_REDIRECT_URL + '&scope=public';

	winPopup = window.open( requestUri, '42', popupParams ); //* enable popup
	// winPopup = window.open( requestUri, '42' ); //* disable popup

	const timeout = setInterval( () => {
		const popupLocation = { ...winPopup.location };

		// If we logged in, kill popup and send request to main window
		if ( popupLocation.host === window.location.host ) {
			// simply add ?redirected query flag for login page to execute login
			onLoginSuccess( ( winPopup.location.href + '&redirected=true' ).substring( FRONT_URL.length ) );
			onPopupClose();
			winPopup.close();
			clearInterval( timeout );
		}
		// If we closed the popup, kill popup
		else if ( winPopup.closed ) {
			winPopup.close();
			clearInterval( timeout );
			onPopupClose();
		}
	}, 250 );
}
//? Sleep of 1000ms may be needed for some browser not to block window popup
