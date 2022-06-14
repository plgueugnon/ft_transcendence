import { useContext } from 'react';
import Containers from '../../components/containers';
import Text from '../../components/text';
import { AuthContext } from '../../contexts/authContext';
import defaultGameImg from '../../images/default-game-preview.gif';
import customGameImg from '../../images/bonus-game-preview.gif';
import homeClucien from '../../images/home-clucien.png'
import homeClorin from '../../images/home-clorin.png'
import homePgueugno from '../../images/home-pgueugno.png'
import homeYgeslin from '../../images/home-ygeslin.png'
import { Grid, GridColumn } from 'semantic-ui-react';
import './components/GameModeHover.css'


export function HomePage(): JSX.Element {
	const authContext = useContext( AuthContext );
	return (
		<>
			<Containers.Page>
				<Text.PageTitle className="forest">Bieeennnvenue</Text.PageTitle>
				<Text.PageSubtitle className="salmon">sur Salmong Toooouuurnament !</Text.PageSubtitle>
				<br />
				{!authContext.isLoggedIn ? (
					<Text.FormSubtitle className="text-right">
						Connectez vous pour commencer... <Text.Paragraph>(en haut - au fond - a droite)</Text.Paragraph>
					</Text.FormSubtitle>
				) : (
					<></>
				)}
				<br />
				<br />
				<br />
				<Text.FormSubtitle>
					Des jeux magnifiiiiiiiques...
				</Text.FormSubtitle>
				<br />
				<Grid columns={2}>
					<GridColumn>
						<div className='game-selection wrapper'>
							<div className='element'>
								<img src={defaultGameImg} width='100%' alt='default game' />
							</div>
							<div className='text'>
								<Text.FormSubtitle>
									Mode Classique
								</Text.FormSubtitle>
							</div>
						</div>
					</GridColumn>
					<GridColumn>
						<div className='game-selection wrapper'>
							<div className='element'>
								<img src={customGameImg} width='100%' alt='custom game' style={{ transition: 'transform 0.15s ease-out' }} />
							</div>
							<div className='text'>
								<Text.FormSubtitle>
									Mode Salmong
								</Text.FormSubtitle>
							</div>
						</div>
					</GridColumn>
				</Grid>
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<Text.FormSubtitle>
					...réalisés par une team à croquer ♡
				</Text.FormSubtitle>
				<br />
				<Grid columns={4} >
					<GridColumn>
						<div className='game-selection wrapper'>
							<div className='element'>
								<img className='homepic' src={homeClorin} width='100%' alt='clorin pic' />
							</div>
							<div className='text'>
								<Text.FormSubtitle className="text-center forest">
									clorin
								</Text.FormSubtitle>
							</div>
						</div>
					</GridColumn>
					<GridColumn>
						<div className='game-selection wrapper'>
							<div className='element'>
								<img className='homepic' src={homeClucien} width='100%' alt='clucien pic' />
							</div>
							<div className='text'>
								<Text.FormSubtitle className="text-center forest">
									clucien
								</Text.FormSubtitle>
							</div>
						</div>
					</GridColumn>
					<GridColumn>
						<div className='game-selection wrapper'>
							<div className='element'>
								<img className='homepic' src={homePgueugno} width='100%' alt='pgueugno pic' />
							</div>
							<div className='text'>
								<Text.FormSubtitle className="text-center forest">
									pgueugno
								</Text.FormSubtitle>
							</div>
						</div>
					</GridColumn>
					<GridColumn>
						<div className='game-selection wrapper'>
							<div className='element'>
								<img className='homepic' src={homeYgeslin} width='100%' alt='ygeslin pic' />
							</div>
							<div className='text'>
								<Text.FormSubtitle className="text-center forest">
									ygeslin
								</Text.FormSubtitle>
							</div>
						</div>
					</GridColumn>
				</Grid>
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<br />
				<Text.Paragraph>[Et là... ben ya rien]</Text.Paragraph>
			</Containers.Page>
		</>
	);
}
