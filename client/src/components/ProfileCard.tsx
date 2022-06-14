import { useEffect, useState } from 'react';
import { Grid, GridColumn, Icon, Image, Segment, SemanticSIZES } from 'semantic-ui-react';

import { IUserProfile } from '../interfaces/userProfileInterface';
import { IUsersPublic } from '../interfaces/usersPublicInterface';
import { APP_CUSTOM_UPLOAD_NAME, SEMANTIC_ICON_DEFAULT_USER, SEMANTIC_ICON_LOADING } from '../globals/constants';
import Text from './text';

export type TProfileCardSize = 'small' | 'medium' | 'big';

export interface IProfileCardProps {
	userData: IUserProfile | IUsersPublic;
	size: TProfileCardSize;
	margin?: string;
	basic?: boolean;
	message?: string;
	strongMessage?: boolean;
}

export function ProfileCard( props: IProfileCardProps ): JSX.Element {
	const [ segmentWidth, setSegmentWidth ] = useState<number | string>( 0 );
	const [ avatarSize, setAvatarSize ] = useState<SemanticSIZES | undefined>( undefined );

	//* On mount
	useEffect( () => {
		switch ( props.size ) {
			case 'small':
				setSegmentWidth( '25%' );
				setAvatarSize( 'small' );
				break;
			case 'medium':
				setSegmentWidth( '50%' );
				setAvatarSize( 'small' );
				break;
			case 'big':
				setSegmentWidth( '100%' );
				setAvatarSize( 'medium' );
				break;
			default:
				break;
		}
	}, [] );

	return !segmentWidth || !avatarSize ? (
		<Icon name={SEMANTIC_ICON_LOADING} loading style={{ margin: props.margin }} />
	) : (
		<Segment className="profile-card" style={{ width: segmentWidth, margin: props.margin }} basic={props.basic}>
			<Text.Paragraph>{props.strongMessage ? <strong>{props.message}</strong> : props.message ? props.message : ''}</Text.Paragraph>
			<Grid centered>
				{/* NAME */}
				<Grid.Column verticalAlign="middle" width={10} textAlign="right">
					<Text.FormSubtitle>{props.userData.name}</Text.FormSubtitle>
					<p>
						<strong>{props.userData.login}</strong>
					</p>

					{/* WINS & LOSES */}
					<Grid>
						<GridColumn width={8} textAlign="center">
							<p>
								<strong>Nombre de victoires</strong>
							</p>
							<p>{props.userData.nbOfWins}</p>
						</GridColumn>
						<GridColumn width={8} textAlign="center">
							<p>
								<strong>Nombre de défaites</strong>
							</p>
							<p>{props.userData.nbOfLoses}</p>
						</GridColumn>
					</Grid>
				</Grid.Column>

				{/* AVATAR */}
				<Grid.Column width={6}>
					{props.userData.avatarUrl !== '' && props.userData.avatarUrl !== APP_CUSTOM_UPLOAD_NAME ? (
						<Image circular size={avatarSize} src={props.userData.avatarUrl} />
					) : (
						<Icon size="massive" name={SEMANTIC_ICON_DEFAULT_USER} />
					)}
				</Grid.Column>
			</Grid>
		</Segment>
	);
}
