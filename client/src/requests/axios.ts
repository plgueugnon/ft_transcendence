import axios, { AxiosPromise } from 'axios';

import { APP_COOKIE_NAME } from '../globals/constants';
import { TRequestMethods } from '../globals/types';

export async function axiosJsonBearer( url: string, method: TRequestMethods, body?: any ): Promise<AxiosPromise> {
	const storedItem = localStorage.getItem( APP_COOKIE_NAME );
	let headers;
	if ( storedItem ) {
		const storedData = JSON.parse( storedItem );

		headers = {
			Authorization: 'Bearer ' + storedData.token,
			'Content-Type': 'application/json',
		};
	} else {
		headers = {
			'Content-Type': 'application/json',
		};
	}

	const response = await axios( {
		method: method,
		url: url,
		data: JSON.stringify( body ),
		headers: headers,
	} );
	return response;
}
