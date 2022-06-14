import { IGameHistory } from './../interfaces/gameScore';
import { API_URL } from '../globals/constants';
import { axiosJsonBearer } from './axios';

export async function getAllGameHistory(): Promise<IGameHistory[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/game/history', 'GET' );
		return await response.data;
	} catch ( error ) {
		return undefined;
	}
}

export async function getGameHistoryByLogin( login: string ): Promise<IGameHistory[] | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/game/history/' + login, 'GET', login );
		return await response.data;
	} catch ( error ) {
		return undefined;
	}
}

export async function postGameHistory( newGame: IGameHistory ): Promise<number | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/game/history', 'POST', newGame );
		return response.status;
		// return response.status;
	} catch ( e ) {
		return 403;
	}
}
