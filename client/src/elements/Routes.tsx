import { useContext, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AuthContext } from '../contexts/authContext';
import { APP_2FA_PATH, APP_ERROR_PATH, APP_LOGIN_REDIRECT_PATH, APP_PLAY_PATH, APP_PROFILE_PATH, APP_UNAUTHORIZED_PATH, APP_USER_SEARCH_PATH } from '../globals/constants';
import { ChatPage } from '../pages/chat/ChatPage';
import { ErrorNoServerPage } from '../pages/endpoints/ErrorNoServerPage';
import { ErrorNotFoundPage } from '../pages/endpoints/ErrorNotFoundPage';
import { ErrorUnauthorizedPage } from '../pages/endpoints/ErrorUnauthorizedPage';
import { HomePage } from '../pages/home/HomePage';
import { GamePage } from '../pages/jouer/GamePage';
import { LeaderboardPage } from '../pages/leaderboard/LeaderboardPage';
import { LoginPage } from '../pages/login/LoginPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { PublicProfilePage } from '../pages/publicProfile/PublicProfilePage';
import { SalonsPage } from '../pages/salons/SalonsPage';
import { TwoFaPage } from '../pages/twofa/TwoFaPage';
import { UsersSearchPage } from '../pages/users-search/UsersSearchPage';

/**
 * PrivateRoute
 * Check for authorizations when navigating to pages
 */
export function MyRoutes(): JSX.Element {
	const authContext = useContext( AuthContext );

	return (
		<Routes>
			{/* PUBLIC */}
			<Route path="/" element={<HomePage />} />
			{/* Authentication */}
			<Route path={APP_LOGIN_REDIRECT_PATH} element={<LoginPage />} />
			<Route path={APP_2FA_PATH} element={<TwoFaPage />} />

			{/* AUTHENTICATED */}
			<Route path={APP_PLAY_PATH} element={authContext.isLoggedIn ? <GamePage /> : <ErrorUnauthorizedPage />} />
			{/* Error on first login */}
			<Route path="/leaderboard" element={authContext.isLoggedIn ? <LeaderboardPage /> : <ErrorUnauthorizedPage />} />
			<Route path="/salons" element={authContext.isLoggedIn ? <SalonsPage /> : <ErrorUnauthorizedPage />} />
			<Route path="/chat" element={authContext.isLoggedIn ? <ChatPage /> : <ErrorUnauthorizedPage />} />
			{/* Users and profile */}
			<Route path={APP_USER_SEARCH_PATH} element={authContext.isLoggedIn ? <UsersSearchPage /> : <ErrorUnauthorizedPage />} />
			<Route path={APP_USER_SEARCH_PATH + '/:login'} element={authContext.isLoggedIn ? <PublicProfilePage /> : <ErrorUnauthorizedPage />} />
			<Route path={APP_PROFILE_PATH} element={authContext.isLoggedIn ? <ProfilePage /> : <ErrorUnauthorizedPage />} />

			{/* END POINTS (public) */}
			{/* End points */}
			<Route path={APP_ERROR_PATH} element={<ErrorNoServerPage />} />
			<Route path={APP_UNAUTHORIZED_PATH} element={<ErrorUnauthorizedPage />} />
			<Route path="*" element={<ErrorNotFoundPage />} />
		</Routes>
	);
}
