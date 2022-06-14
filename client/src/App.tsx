import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import { AuthContextProvider } from './contexts/authContextProvider';
import ScreenTransitions from './components/screenTransitions';
import { VectorsShapeA } from './components/vectors';
import { HeaderMenu } from './elements/HeaderMenu';
import { MyRoutes } from './elements/Routes';
import { NotifContextProvider } from './contexts/NotifContextProvider';
import { RouteTrackerContext } from './contexts/routeTrackerContext';

function App() {
	const [ isAppLoaded, setIsAppLoaded ] = useState<boolean>( false );
	const [ trackGameID, setGameIDTracker ] = useState<string>( '' );

	return (
		<BrowserRouter>
			<NotifContextProvider>
				<AuthContextProvider setIsAppLoaded={setIsAppLoaded}>
					{!isAppLoaded ? (
						<ScreenTransitions.Loading />
					) : (
						<>
							<RouteTrackerContext.Provider
								value={{
									gameID: trackGameID,
									setGameID: setGameIDTracker,
								}}
							>
								<HeaderMenu />
								<VectorsShapeA />
								<MyRoutes />
							</RouteTrackerContext.Provider>
						</>
					)}
				</AuthContextProvider>
			</NotifContextProvider>
		</BrowserRouter>
	);
}

export default App;
