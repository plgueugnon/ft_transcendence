import { useEffect, useState } from 'react';
import { switchBool } from '../globals/utils';

/**
 * useKeyRelease()
 * @param targetKey key to "watch"
 * Keyboard action watcher
 * @returns switch return value to false/true each time targetKey is released
 */
export function useKeyReleaseSwitch( targetKey: string ) {
	// State for keeping track of whether key is released
	const [ keyPressed, setKeyPressed ] = useState<boolean>( false );

	// If released key is our target key then set to false
	const upHandler = ( { key }: any ) => {
		if ( key === targetKey )
			setKeyPressed( switchBool( keyPressed ) );
	};

	// Add event listeners
	useEffect( () => {
		window.addEventListener( 'keyup', upHandler );
		// Remove event listeners on cleanup
		return () => {
			window.removeEventListener( 'keyup', upHandler );
		};
	}, [] ); // Empty array ensures that effect is only run on mount and unmount
	return keyPressed;
}
