import { useState, useEffect } from 'react';

/**
 * useKeyPress()
 * @param targetKey key to "watch"
 * Keyboard action watcher
 * @returns a true when targetKey is pressed, and a false when it's released
 */
export function useKeyPress( targetKey: string ) {
	// State for keeping track of whether key is pressed
	const [ keyPressed, setKeyPressed ] = useState<boolean>( false );
	// If pressed key is our target key then set to true
	const downHandler = ( { key }: any ) => {
		if ( key === targetKey )
			setKeyPressed( true );
	};
	// If released key is our target key then set to false
	const upHandler = ( { key }: any ) => {
		if ( key === targetKey )
			setKeyPressed( false );
	};

	// Add event listeners
	useEffect( () => {
		window.addEventListener( 'keydown', downHandler );
		window.addEventListener( 'keyup', upHandler );
		// Remove event listeners on cleanup
		return () => {
			window.removeEventListener( 'keydown', downHandler );
			window.removeEventListener( 'keyup', upHandler );
		};
	}, [] ); // Empty array ensures that effect is only run on mount and unmount
	return keyPressed;
}
