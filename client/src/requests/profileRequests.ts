import axios from 'axios';
import { API_URL, APP_COOKIE_NAME } from '../globals/constants';
import { IProfileSettings } from '../interfaces/profileSettingsInterface';
import { IUserProfile } from '../interfaces/userProfileInterface';
import { axiosJsonBearer } from './axios';

/**
 * postUserEdit()
 * @param userCreationData
 */
export async function postUserEdit( userCreationData: IProfileSettings ): Promise<number> {
	try {
		const response = await axiosJsonBearer( API_URL + '/users/edit', 'POST', userCreationData );
		return response.status;
	} catch ( err ) {
		return 0;
	}
}

/**
 * postCustomAvatar()
 * @param image
 * @returns
 */
export async function postCustomAvatar( image: File ): Promise<number> {
	const storedItem = localStorage.getItem( APP_COOKIE_NAME );
	if ( storedItem ) {
		// token
		const storedData = JSON.parse( storedItem );
		const headers = {
			Authorization: 'Bearer ' + storedData.token,
			'Content-Type': 'multipart/form-data',
		};

		// file
		let formData = new FormData();
		formData.append( 'file', image );

		try {
			// request
			const response = await axios.post( API_URL + '/users/upload-avatar', formData, { headers: headers } );
			return response.status;
		} catch ( err ) {
			return 0;
		}
	} else return 401;
}

/**
 * getUserProfile()
 */
export async function getUserProfile( userLogin: string ): Promise<IUserProfile | undefined> {
	try {
		const response = await axiosJsonBearer( API_URL + '/users/profile/' + userLogin, 'GET' );
		const userProfileData: IUserProfile = await response.data;
		if ( response.status === 200 ) {
			return userProfileData;
		} else {
			return undefined;
		}
	} catch ( err ) {
		return undefined;
	}
}

/**
 * deleteUserProfile()
 */
export async function deleteUserProfile( userLogin: string ): Promise<number> {
	try {
		const response = await axiosJsonBearer( API_URL + '/users/login/' + userLogin, 'DELETE' );
		return response.status;
	} catch ( err ) {
		return 0;
	}
}
