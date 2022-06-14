import { useEffect, useRef, useState } from 'react';
import { Icon, Input } from 'semantic-ui-react';

import './UsernameInput.css';
import { getUsersInfos } from '../requests/usersRequests';
import { DEFAULT_NAME_BY_LOGIN, DEFAULT_USERNAMES_TAB, USERNAME_MAX_LENGTH } from '../globals/constants';
import { rand } from '../globals/utils';

interface IUsernameInputProps {
	value: string;
	setValue: ( newValue: string ) => void;
	placeholder: string;
	setPlaceholder: ( newPlaceholder: string ) => void;
	setIsNameAvailable: ( newBool: boolean ) => void; // If newName (value) already exists, we can't chose it
	login: string;
	currentName: string; // Current name of the user (not a problem if we chose the same)
	label?: string;
}

export function UsernameInput( props: IUsernameInputProps ): JSX.Element {
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
	const [ allUsersName, setAllUsersName ] = useState<string[] | undefined>( undefined );
	const [ valueCheckStatus, setValueCheckStatus ] = useState<'check' | 'circle notch' | 'times'>( 'times' );

	//* On value change
	useEffect( () => {
		setValueCheckStatus( 'circle notch' );
		props.setIsNameAvailable( false );

		if ( allUsersName )
			checkName();
	}, [ props.value ] );

	//* On allUsersName resolve
	useEffect( () => {
		if ( !allUsersName )
			return;

		checkName();
	}, [ allUsersName ] );

	//* On mount
	useEffect( () => {
		refreshNameCatalog();
	}, [] );

	//? ACTIONS

	const refreshNameCatalog = async () => {
		setValueCheckStatus( 'circle notch' );
		const	response = await getUsersInfos();
		if ( !mounted.current )
			return;

		if ( response )
			setAllUsersName( response.map( ( element ) => element.name ) );
	}

	const checkName = () => {
		if ( !allUsersName )
			return;

		if ( ( props.value === props.currentName || !allUsersName.includes( props.value ) ) && props.value !== '' )
		{
			props.setIsNameAvailable( true );
			setValueCheckStatus( 'check' );
		}
		else
			setValueCheckStatus( 'times' );
	};

	/**
	 * generateNewPlaceholder
	 * @param generateValue if true function also set props.value to the placeholder value.
	 */
	const generateNewPlaceholder = ( generateValue?: boolean ) => {
		let newPlaceholder;
		while ( ( newPlaceholder = DEFAULT_USERNAMES_TAB[ rand( 0, DEFAULT_USERNAMES_TAB.length ) ] ) === props.placeholder ) { }

		if ( generateValue )
			props.setValue( newPlaceholder );

		// If user's login is found in logins DEFAULT_NAME_BY_LOGIN tab
		let pair: string[][];
		if ( ( pair = DEFAULT_NAME_BY_LOGIN.filter( ( element ) => element[ 0 ] === props.login ) ).length ) {
			newPlaceholder = pair[ 0 ][ 1 ];
			props.setValue( newPlaceholder );
		} // tmp deactivated

		props.setPlaceholder( newPlaceholder );
	};

	const	handleChange = ( event: any ) => {
		if ( event.target.value.length === 0 || event.target.value.length <= USERNAME_MAX_LENGTH )
			props.setValue( event.target.value );
		refreshNameCatalog();
	}

	return (
		<>
			<Input
				size="big"
				value={props.value}
				placeholder={props.placeholder}
				onChange={ event => handleChange( event ) }
				error={valueCheckStatus === 'times'}
				label={props.label}
				icon={<Icon name="random" circular link onClick={() => generateNewPlaceholder( true )} />}
			/>
			&emsp;&emsp;&emsp;
			<Icon size="large" loading={valueCheckStatus === 'circle notch'} name={valueCheckStatus} color={valueCheckStatus === 'check' ? 'green' : valueCheckStatus === 'times' ? 'red' : 'black'} />
			{valueCheckStatus === 'times' && props.value !== '' ? <p className="red">{'Ce nom est déjà pris :('}</p> : <p>&emsp;</p>}
		</>
	);
}
