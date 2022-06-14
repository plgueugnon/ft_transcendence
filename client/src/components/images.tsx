import { useEffect, useState } from 'react';
import { Image, Label } from 'semantic-ui-react';
import { sleep } from '../globals/utils';
import './images.css';

namespace Images {
	interface IAvatarSelectionProps {
		imageUrl: string;
		onClick?: Function;
		active?: boolean;
		disabled?: boolean;
	}

	export function AvatarSelection( props: IAvatarSelectionProps ): JSX.Element {
		const [ flipClass, setFlipClass ] = useState<string>( 'aselect' );

		//* On active change
		useEffect( () => {
			if ( props.active )
				handleClick();
			else
				setFlipClass( 'aselect' );
		}, [ props.active ] );

		const handleMouseEnter = () => {
			setFlipClass( 'aselect-scale-flip' );
		};

		const handleMouseLeave = () => {
			if ( !props.active )
				setFlipClass( 'aslect' );
		};

		const handleClick = () => {
			if ( props.active ) {
				setFlipClass( 'aselect-scale-up-flip' );
				sleep( 100 ).then( () => setFlipClass( 'aselect-scale-flip' ) );
			}
		};

		return (
			<div
				onClick={() => {
					if ( !props.disabled ) {
						handleClick();
						if ( props.onClick )
							props.onClick();
					}
				}}
				onMouseEnter={() => handleMouseEnter()}
				onMouseLeave={() => handleMouseLeave()}
			>
				<Image circular size="small" className={flipClass + ' pointer'} src={props.imageUrl} alt="Avatar" disabled={props.disabled} />
				{props.active ? <Label color="grey" floating circular empty /> : <></>}
			</div>
		);
	}
}

export default Images;
