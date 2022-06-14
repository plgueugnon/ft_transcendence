import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, Image, List, Popup } from 'semantic-ui-react';
import { SEMANTIC_ICON_LOADING } from '../globals/constants';
import { TJsxChildren } from '../globals/types';
import { postFriendAccept, postFriendDeny } from '../requests/friendsRequests';

namespace Lists {
	interface IUsersProps {
		className?: string;
		children?: TJsxChildren;
		selection?: boolean;
	}

	export function Users( props: IUsersProps ): JSX.Element {
		return (
			<div className={props.className}>
				<List selection={props.selection} verticalAlign="middle">
					{props.children}
				</List>
			</div>
		);
	}

	interface IUserProps {
		name: string;
		login: string;
		avatarUrl: string;
		userSearchPath: string;
		userSearchHash?: string;
		className?: string;
		onButtonClick?: Function;
		denyButton?: boolean;
		denyPopup?: string;
		acceptButton?: boolean;
		acceptPopup?: string;
	}

	export function User( props: IUserProps ): JSX.Element {
		//? HOOKS
		// Mounted
		const mounted = useRef( false );
		useEffect( () => {
			mounted.current = true;
			return () => {
				mounted.current = false;
			};
		}, [] );
		const [ nameWidth, setNameWidth ] = useState<14 | 15 | 16>( 16 );
		const [ areIconsLoading, setAreIconsLoading ] = useState<boolean>( false );
		const navigate = useNavigate();

		//* On buttons change
		useEffect( () => {
			if ( props.denyButton && props.acceptButton )
				setNameWidth( 14 );
			else if ( props.denyButton || props.acceptButton )
				setNameWidth( 15 );
			else
				setNameWidth( 16 );
		}, [ props.denyButton, props.acceptButton ] );

		//? ACTIONS

		const handleAcceptClick = async ( login: string ) => {
			setAreIconsLoading( true );

			const status = await postFriendAccept( login );
			if ( !mounted.current )
				return;

			if ( status === 201 )
				setAreIconsLoading( false );
			// On list click action
			if ( props.onButtonClick )
				props.onButtonClick();
		};

		const handleDenyClick = async ( login: string ) => {
			setAreIconsLoading( true );

			const status = await postFriendDeny( login );
			if ( !mounted.current )
				return;

			if ( status === 201 )
				setAreIconsLoading( false );
			// On list click action
			if ( props.onButtonClick )
				props.onButtonClick();
		};

		return (
			<List.Item
				className={props.className}
				onClick={() => {
					// If there's no button, make all row clickable action
					if ( nameWidth === 16 )
						navigate( props.userSearchPath + '/' + props.login + ( props.userSearchHash ? props.userSearchHash : '' ) );
				}}
			>
				<Image avatar src={props.avatarUrl} />
				<List.Content>
					<List.Header>
						<Link to={props.userSearchPath + '/' + props.login + ( props.userSearchHash ? props.userSearchHash : '' )}>{props.name}</Link>
					</List.Header>
				</List.Content>
				<List.Content floated="right">
					{areIconsLoading ? (
						<Icon name={SEMANTIC_ICON_LOADING} loading disabled />
					) : (
						<>
							{
								// DENY BUTTON
								props.denyButton ? (
									<Popup
										position="top center"
										size="tiny"
										trigger={<Icon size="large" color="red" name="times" className="pointer" onClick={() => handleDenyClick( props.login )} />}
										content={props.denyPopup}
									/>
								) : (
									<></>
								)
							}
							{
								// ACCEPT BUTTON
								props.acceptButton ? (
									<>
										&emsp;
										<Popup
											position="top center"
											size="tiny"
											trigger={<Icon size="large" color="green" name="check" className="pointer" onClick={() => handleAcceptClick( props.login )} />}
											content={props.acceptPopup}
										/>
									</>
								) : (
									<></>
								)
							}
						</>
					)}
				</List.Content>
			</List.Item>
		);
	}
}

export default Lists;
