import { useEffect, useState } from 'react';
import { Grid } from 'semantic-ui-react';

import './AvatarSelectionTab.css';
import Images from '../components/images';
import { APP_CUSTOM_UPLOAD_NAME, DEFAULT_AVATARS_TAB, DEFAULT_SQUARE_IMAGE_URL } from '../globals/constants';
import { sleep } from '../globals/utils';
import Buttons from '../components/buttons';

interface IAvatarSelectionTab {
	setAvatarUrl: ( url: string ) => void;
	setCustomFile: ( file: File | undefined ) => void;
	curentAvatar?: string;
	className?: string;
}

export function AvatarSelectionTab( props: IAvatarSelectionTab ): JSX.Element {
	const [ activeAvatar, setActiveAvatar ] = useState<number | undefined>( undefined );
	const [ customAvatarFile, setCustomAvatarFile ] = useState<File | undefined | 'current'>( undefined );
	const [ currentCustomAvatar, setCurrentCustomAvatar ] = useState<string>( DEFAULT_SQUARE_IMAGE_URL );

	//? ACTIONS

	//* On mount, set the curent avatar
	useEffect( () => {
		if ( props.curentAvatar ) {
			if ( props.curentAvatar.match( /(http:\/\/localhost:5001)/ ) ) {
				//! Warning: this does not use CONSTS
				setCurrentCustomAvatar( props.curentAvatar );
				setCustomAvatarFile( 'current' );
				setActiveAvatar( DEFAULT_AVATARS_TAB.length );
			} else
				setActiveAvatar( DEFAULT_AVATARS_TAB.indexOf( props.curentAvatar ) );
		}
	}, [] );

	//* On customAvatarFile change (upload)
	useEffect( () => {
		if ( customAvatarFile )
			handleCustomAvatarClick();
	}, [ customAvatarFile ] );

	const handleDefaultAvatarClick = ( avatarUrl: string, avatarIndex: number ) => {
		setActiveAvatar( avatarIndex );
		props.setAvatarUrl( avatarUrl );
		props.setCustomFile( undefined );
	};

	const handleCustomAvatarClick = () => {
		setActiveAvatar( DEFAULT_AVATARS_TAB.length );
		// If we set previously setted image, no need to re write it
		if ( customAvatarFile !== 'current' ) {
			props.setAvatarUrl( APP_CUSTOM_UPLOAD_NAME );
			props.setCustomFile( customAvatarFile );
		}
		// Just set the avatar url as it is already uploaded
		else if ( props.curentAvatar )
			props.setAvatarUrl( props.curentAvatar );
	};

	const handleCustomAvatarUpload = ( event: any ) => {
		if ( event.target.files && event.target.files[ 0 ] ) {
			setActiveAvatar( -1 );
			sleep( 100 ).then( () => {
				setCustomAvatarFile( event.target.files[ 0 ] );
				setActiveAvatar( DEFAULT_AVATARS_TAB.length );
			} );
		}
	};

	return (
		<div className={'avatar-selection ' + props.className}>
			<Grid columns="equal">
				{/* DEFAULTS */}
				{DEFAULT_AVATARS_TAB.map( ( element, index ) => (
					<Grid.Column key={index}>
						<Images.AvatarSelection imageUrl={element} active={activeAvatar === index} onClick={() => handleDefaultAvatarClick( element, index )} />
					</Grid.Column>
				) )}
				{/* CUSTOMS */}
				<Grid.Column>
					<Images.AvatarSelection
						disabled={customAvatarFile === undefined}
						imageUrl={customAvatarFile === undefined || customAvatarFile === 'current' ? currentCustomAvatar : URL.createObjectURL( customAvatarFile )}
						active={activeAvatar === DEFAULT_AVATARS_TAB.length}
						onClick={() => handleCustomAvatarClick()}
					/>
				</Grid.Column>
			</Grid>
			<br />
			<br />
			<br />
			<br />
			<Buttons.Input value="Ajoutez votre Avatar" accept="image/*" onChange={( event: any ) => handleCustomAvatarUpload( event )} />
		</div>
	);
}
