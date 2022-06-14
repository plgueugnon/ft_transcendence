import { Icon, Image, Label } from 'semantic-ui-react';
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import './menuItems.css';
import { TJsxChildren } from '../globals/types';
import { sleep } from '../globals/utils';
import { BUTTON_LOADING_NAME, SEMANTIC_ICON_DEFAULT_USER } from '../globals/constants';

namespace MenuItems {
	interface IMenuItemProps {
		url: string;
		name?: string;
		active?: boolean;
		iconName?: SemanticICONS;
		avatarUrl?: string;
		notifications?: number;
	}

	export function Basic( props: IMenuItemProps ): JSX.Element {
		const [ iconClass, setIconClass ] = useState<string>( '' );

		const handleMouseEnter = () => {
			setIconClass( 'menu-rotated' );
		};

		const handleMouseLeave = () => {
			setIconClass( '' );
		};

		const handleClick = () => {
			if ( iconClass === '' ) {
				setIconClass( 'menu-rotated' );
				sleep( 200 ).then( () => setIconClass( '' ) );
			} else
				setIconClass( '' );
		};

		return (
			<Link
				to={props.url}
				onMouseEnter={() => handleMouseEnter()}
				onMouseLeave={() => handleMouseLeave()}
				onClick={() => handleClick()}
				className={props.active ? 'menu-item-active' : 'menu-item'}
			>
				{props.iconName ? <Icon className={iconClass} name={props.iconName} /> : ''}
				{props.name}
			</Link>
		);
	}

	export interface IMenuItemButton {
		name: string;
		onClick: Function;
		active?: boolean;
		image?: any;
		icon?: SemanticICONS;
	}

	export function Button( props: IMenuItemButton ): JSX.Element {
		return (
			<button className={'pointer menu-item ' + ( props.active ? 'menu-button-active' : 'menu-button' )} onClick={() => props.onClick()}>
				{props.image && props.name !== BUTTON_LOADING_NAME ? <img src={props.image} height="50px" alt='button' /> : ''}
				{props.name === BUTTON_LOADING_NAME ? (
					<Icon loading name="sync" />
				) : props.image ? (
					<p>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;{props.name} </p>
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

	export function Avatar( props: IMenuItemProps ): JSX.Element {
		const [ flippedClass, setFlippedClass ] = useState<string>( '' );

		//* On active change
		useEffect( () => {
			if ( props.active )
				setFlippedClass( 'flipped' );
			else
				setFlippedClass( '' );
		}, [ props.active ] );

		const handleClick = () => {
			if ( props.active ) {
				setFlippedClass( '' );
				sleep( 200 ).then( () => setFlippedClass( 'flipped' ) );
			}
		};

		return (
			<Link to={props.url} className={'menu-item avatar' + ( props.active ? ' active' : '' )} onClick={() => handleClick()}>
				{props.name ? (
					<>
						{props.name}&emsp;
						<Icon.Group className={flippedClass}>
							{props.avatarUrl === '' ? <Icon name={SEMANTIC_ICON_DEFAULT_USER} size="big" /> : <Image avatar className={'avatar'} src={props.avatarUrl} />}
							{props.notifications && !props.active ? (
								<Label circular color="red" floating size="mini">
									{props.notifications}
								</Label>
							) : (
								<></>
							)}
						</Icon.Group>
					</>
				) : props.avatarUrl === '' ? (
					<Icon name={SEMANTIC_ICON_DEFAULT_USER} size="big" />
				) : (
					<Image avatar className={'avatar ' + flippedClass} src={props.avatarUrl} />
				)}
			</Link>
		);
	}

	export function IconItem( props: IMenuItemProps ): JSX.Element {
		const [ iconClass, setIconClass ] = useState<string>( '' );

		//* On active change
		useEffect( () => {
			if ( props.active )
				setIconClass( 'menu-rotated-icon-item' );
			else
				setIconClass( '' );
		}, [ props.active ] );

		const handleClick = () => {
			if ( props.active ) {
				setIconClass( '' );
				sleep( 200 ).then( () => setIconClass( 'menu-rotated-icon-item' ) );
			}
		};

		return (
			<Link to={props.url} className={'menu-item ' + ( props.active ? 'menu-icon-active' : 'menu-icon' )} onClick={() => handleClick()}>
				<>
					{props.name ? <>{props.name} &emsp;</> : ''}
					<Icon.Group className={iconClass}>
						<Icon size="large" name={props.iconName} />
						{props.notifications && !props.active ? (
							<Label circular color="red" floating size="mini">
								{props.notifications}
							</Label>
						) : (
							<></>
						)}
					</Icon.Group>
				</>
			</Link>
		);
	}

	interface IMenuTitleProps {
		children: TJsxChildren;
		url: string;
		active?: boolean;
	}

	export function TitleHref( props: IMenuTitleProps ): JSX.Element {
		return (
			<a href={props.url} className={props.active ? 'menu-title-active' : 'menu-title'}>
				{props.children}
			</a>
		);
	}

	export function TitleLink( props: IMenuTitleProps ): JSX.Element {
		return (
			<Link to={props.url} className={props.active ? 'menu-title-active' : 'menu-title'}>
				{props.children}
			</Link>
		);
	}

	interface ISearchButtonProps {
		value: string;
		setValue: ( newValue: string ) => void;
		active: boolean;
		setActive: Function;
		onClick: Function;
		placeholder?: string;
		icon?: SemanticICONS;
	}

	export function SearchButton( props: ISearchButtonProps ): JSX.Element {
		//? HOOKS
		const inputRef: any = useRef( null );
		const [ iconClass, setIconClass ] = useState<string>( '' );
		const [ iconHoverClass, setIconHoverClass ] = useState<string>( '' );
		const [ isMouseHover, setIsMouseHover ] = useState<boolean>( false );

		//* On active change
		useEffect( () => {
			props.setValue( '' );
			if ( props.active ) {
				sleep( 200 ).then( () => {
					setIconClass( 'menu-rotated-icon-item' );
					// to set focus
					// sleep( 1500 ).then( () => inputRef.current.focus() );
				} );
			} else if ( !props.active ) {
				inputRef.current.blur();
				setIconClass( '' );
			}
		}, [ props.active ] );

		//* On mouse hover
		useEffect( () => {
			// if ( isMouseHover && !props.active )
			// setIconClass( 'menu-rotated-icon-item' );
			// else if ( !isMouseHover && !props.active )
			// setIconClass( '' );
		}, [ isMouseHover ] );

		//? ACTIONS

		const handleMouseEnter = () => {
			setIsMouseHover( true );
			// setIconHoverClass( 'hover' );
		};

		const handleMouseLeave = () => {
			setIsMouseHover( false );
			// setIconHoverClass( '' );
		};

		const handleClick = () => {
			if ( !props.active )
				//TODO To test
				props.setActive( true );
			else if ( props.active ) {
				const prevClass = iconHoverClass;
				setIconHoverClass( prevClass + ' clicked' ); //TODO remove rotate from other right icons
				sleep( 100 ).then( () => setIconHoverClass( prevClass ) );
				props.onClick();
			}
		};

		return (
			<div className={'search-b-wrapper' + ( props.active ? ' active' : '' )} onMouseEnter={() => handleMouseEnter()} onMouseLeave={() => handleMouseLeave()}>
				<div className="input-holder">
					<input
						type="text"
						className="search-input"
						ref={inputRef}
						placeholder={props.placeholder ? props.placeholder : 'Type to search'}
						value={props.value}
						onChange={( event ) => props.setValue( event.target.value )}
					/>

					<button
						className={'search-icon ' + iconClass + ' ' + iconHoverClass}
						onClick={() => {
							handleClick();
						}}
					>
						<span>
							<Icon name="search" />
						</span>
					</button>

					<span className="close" onClick={() => props.setActive( false )}></span>
				</div>
			</div>
		);
	}
}

export default MenuItems;
