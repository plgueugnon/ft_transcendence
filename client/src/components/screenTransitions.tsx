import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/authContext';
import { APP_ERROR_URL } from '../globals/constants';
import Containers from './containers';
import './screenTransitions.css';
// import LoaderGif from '../images/salmong-giphy.gif'
import LoaderGif from '../images/output-onlinegiftools.gif';

namespace ScreenTransitions {
	export function Loading(): JSX.Element {
		const authContext = useContext( AuthContext );

		//* On mount
		// Start a 15sec timer and logout + error path then. Clear when unmounting Loading().
		useEffect( () => {
			// Set timeout
			const timeout = setTimeout( () => {
				authContext.doLogout();
				window.location.replace( APP_ERROR_URL );
			}, 15000 );
			return () => {
				// Clear timeout
				clearTimeout( timeout );
			};
		}, [] );

		return (
			<Containers.NoScroll>
				<br />
				<Containers.Centered noScroll>
					<img src={LoaderGif} alt="loading..." />
				</Containers.Centered>
			</Containers.NoScroll>
		);
	}
}

export default ScreenTransitions;
