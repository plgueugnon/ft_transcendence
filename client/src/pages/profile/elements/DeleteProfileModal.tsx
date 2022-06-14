import { useEffect, useRef, useState } from 'react';
import { Button, GridColumn, Header, Icon, Modal, Popup } from 'semantic-ui-react';
import { SEMANTIC_ICON_LOADING } from '../../../globals/constants';
import { sleep } from '../../../globals/utils';
import { deleteUserProfile } from '../../../requests/profileRequests';

import './DeleteProfileModal.css';

interface IDeleteProfileProps {
	userLogin: string;
	doLogout: Function;
}

export function DeleteProfileModal( props: IDeleteProfileProps ): JSX.Element {
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
	const [ isModalOpen, setIsModalOpen ] = useState<boolean>( false );
	const [ isConfirmLoading, setIsConfirmLoading ] = useState<boolean>( false );

	//? ACTIONS

	const handleConfirmClick = async () => {
		setIsConfirmLoading( true );
		await sleep( 2000 );
		await deleteUserProfile( props.userLogin );
		props.doLogout();
	};

	return (
		<Modal
			basic
			onClose={() => {
				if ( !isConfirmLoading )
					setIsModalOpen( false );
			}}
			onOpen={() => setIsModalOpen( true )}
			open={isModalOpen}
			size="small"
			trigger={
				<Popup
					position="top right"
					size="tiny"
					trigger={<Icon name="trash alternate outline" size="big" className="pointer" onClick={() => setIsModalOpen( true )} />}
					content="Supprimer le profil"
				/>
			}
		>
			<Header icon>
				<Icon name="times" />
				Supprimer le profil
			</Header>
			<Modal.Content>
				<GridColumn textAlign="center">Souhaitez vous vraiment supprimer votre profil ? Cette action est irréversible.</GridColumn>
			</Modal.Content>
			<Modal.Actions>
				<Button basic color="grey" onClick={() => setIsModalOpen( false )}>
					<Icon name="remove" /> Non
				</Button>
				<Button color="red" inverted onClick={() => handleConfirmClick()}>
					<Icon loading={isConfirmLoading} name={isConfirmLoading ? SEMANTIC_ICON_LOADING : 'checkmark'} /> Oui
				</Button>
			</Modal.Actions>
		</Modal>
	);
}
