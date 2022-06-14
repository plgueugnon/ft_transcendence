import { Link } from 'react-router-dom';
import { Icon, SemanticICONS } from 'semantic-ui-react';
import { BUTTON_LOADING_NAME } from '../globals/constants';

import './buttons.css';

namespace Buttons {
	interface IReturnProps {
		href: string;
	}

	/**
	 * ReturnHref()
	 * Load to the given href
	 */
	export function ReturnHref( props: IReturnProps ): JSX.Element {
		return (
			<a href={props.href} className="return-button">
				<Icon name="arrow left" /> RETOUR
			</a>
		);
	}

	/**
	 * ReturnLink()
	 * Links to the given href
	 */
	export function ReturnLink( props: IReturnProps ): JSX.Element {
		return (
			<Link to={props.href} className="return-button">
				<Icon name="arrow left" /> RETOUR
			</Link>
		);
	}

	interface IConfirmProps {
		name: string;
		onClick: Function;
		// Optional
		active?: boolean;
		image?: any;
		icon?: SemanticICONS;
		disabled?: boolean;
	}

	export function Confirm( props: IConfirmProps ) {
		return (
			<button
				className={'pointer confirm' + ( props.active ? ' confirm-active' : ' confirm' ) + ( props.disabled ? ' button-disabled' : '' )}
				onClick={() => {
					if ( !props.disabled )
						props.onClick();
				}}
			>
				{props.image && props.name !== BUTTON_LOADING_NAME ? <img src={props.image} height="50px" alt='button'/> : ''}
				{props.name === BUTTON_LOADING_NAME ? (
					<Icon loading name="sync" />
				) : props.image ? (
					<p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; {props.name} </p>
				) : props.icon ? (
					<>
						<p>
							{props.name} <Icon name={props.icon} />
						</p>
					</>
				) : (
					props.name
				)}
			</button>
		);
	}

	interface IInputProps {
		accept: string;
		onChange: Function;
		// Optional
		value?: string;
	}

	export function Input( props: IInputProps ): JSX.Element {
		return (
			<div className="input-button">
				<input
					// value={ props.value ? props.value : 'Upload' }
					type="file"
					accept={props.accept}
					onChange={( event: any ) => props.onChange( event )}
				/>
			</div>
		);
	}
}

export default Buttons;
