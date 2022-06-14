import { Modal } from 'semantic-ui-react';

import './GameSettingsModal.css';
import { TJsxChildren } from '../../../globals/types';
import defaultGameImg from '../../../images/default-game-preview.png';
import customGameImg from '../../../images/bonus-game-preview.png';
import Text from '../../../components/text';

interface IGameSettingsModal {
	trigger?: TJsxChildren;
	onSelect: Function;
	isModalOpen: boolean;
	setIsModalOpen: Function;
}

export function GameSettingsModal( props: IGameSettingsModal ): JSX.Element {
	return (
		<Modal basic
			onClose={() => props.setIsModalOpen( false )}
			onOpen={() => props.setIsModalOpen( true )}
			open={props.isModalOpen}
			size='small'
			trigger={props.trigger}
		>
			<div className='paddle-selection wrapper'>
				{/* DEFAULT */}
				<div className='element'
					onClick={() => {
						props.setIsModalOpen( false )
						props.onSelect( false )
					}}
				>
					<img className='pointer' src={defaultGameImg} width='500px' alt='default game'/>
					<div className='text'>
						<Text.FormSubtitle>
							Mode Classique
						</Text.FormSubtitle>
					</div>
				</div>
				{/* CUSTOM */}
				<div className='element'
					onClick={() => {
						props.setIsModalOpen( false )
						props.onSelect( true )
					}}
				>
					<img className='pointer' src={customGameImg} width='500px' alt='custom game' />
					<div className='text'>
						<Text.FormSubtitle>
							Mode Salmong
						</Text.FormSubtitle>
					</div>
				</div>
			</div>
		</Modal >
	);
}
