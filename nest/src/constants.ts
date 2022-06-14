// KEYS

import { EFriend } from './friends/interfaces/friend.entity';
import { EUser } from './users/interfaces/user.entity';

export const JwtConstants = {
	secret: process.env.JWT_KEY || 'LALA',
};
export const FT_API_UID = process.env.INTRA_UID;
export const FT_API_SECRET = process.env.INTRA_SECRET;

// PATH RELATED

export const API_AVATAR_GET_PATH = '/users/avatars';

// URL RELATED

export const HOST_NAME = 'http://localhost';
export const APP_URL = HOST_NAME + ':3000';
export const API_URL = HOST_NAME + ':5001';

export const FT_API_URL = 'https://api.intra.42.fr';
export const APP_LOGIN_REDIRECT_URL = APP_URL + '/sg-login';
export const API_AVATAR_GET_URL = API_URL + API_AVATAR_GET_PATH;

// NORMS

export const USERNAME_MAX_LENGTH = 20;
export const CHANNELNAME_MAX_LENGTH = 30;
export const PASSWORD_MAX_LENGTH = 30;
export const TIMESTAMP_MAX_LENGTH = 80;
export const MESSAGE_MAX_LENGTH = 250;
export const TWOFA_CODE_LENGTH = 6;
export const TWOFA_CODE_SALTS = 2;
export const FT_MAIL_ADDRESS = '@student.42.fr';

// DATA

export const SAMPLE_FRIENDS: EFriend[] = [
	{
		id: 1,
		sender: 'ouiouilecowboy',
		receiver: 'clucien',
		status: 'pending',
	},
	{
		id: 2,
		sender: 'colt',
		receiver: 'clucien',
		status: 'accepted',
	},
	{
		id: 3,
		sender: 'clucien',
		receiver: 'loserboy',
		status: 'pending',
	},
	{
		id: 4,
		sender: 'theguy',
		receiver: 'clucien',
		status: 'pending',
	},
];

export const SAMPLE_USERS: EUser[] = [
	{
		id: 1,
		login: 'ouiouilecowboy',
		name: 'CTO at Gucci',
		role: 'user',
		avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/250px-Image_created_with_a_mobile_phone.png',
		nbOfWins: 3,
		nbOfLoses: 1,
		isTwoFa: false,
	},
	{
		id: 2,
		login: 'colt',
		name: 'Head of the CCorp',
		role: 'user',
		avatarUrl: 'https://images.ctfassets.net/rporu91m20dc/5B0K315SudSnODQUVk07P9/4a050715dbca84ceadc9f3a4885b9748/DEATHLOOP-her-launch-m.jpg?q=70',
		nbOfWins: 10,
		nbOfLoses: 8,
		isTwoFa: false,
	},
	{
		id: 3,
		login: 'loserboy',
		name: 'Loozer',
		role: 'user',
		avatarUrl: 'https://img-4.linternaute.com/ILFe5tCoQp-b0LByv666Yax0y1A=/1240x/smart/5896ee71b2c84de9bc170cc16c256067/ccmcms-linternaute/10959429.jpg',
		nbOfWins: 1,
		nbOfLoses: 5,
		isTwoFa: false,
	},
	{
		id: 4,
		login: 'theguy',
		name: 'The Guy',
		role: 'user',
		avatarUrl: 'https://i.pinimg.com/736x/0a/8a/e7/0a8ae723217856309eb9e6194e0226b7.jpg',
		nbOfWins: 10,
		nbOfLoses: 2,
		isTwoFa: false,
	},
];

export const DEFAULT_AVATARS_PATH = APP_URL + '/images/default_avatars/';

export const DEFAULT_AVATARS_TAB: string[] = [
	DEFAULT_AVATARS_PATH + 'default_0.png',
	DEFAULT_AVATARS_PATH + 'default_1.png',
	DEFAULT_AVATARS_PATH + 'default_2.png',
	DEFAULT_AVATARS_PATH + 'default_3.png',
	DEFAULT_AVATARS_PATH + 'default_4.png',
	DEFAULT_AVATARS_PATH + 'default_5.png',
];

export const DEFAULT_USERNAMES_TAB = [
	'Le Roi de la plancha',
	'Le Saumon fou',
	'Salmonzar Serpentard',
	'Captain Morgan',
	'Mr JB',
	'Tallisker',
	'Big Pete',
	'Mac Allan',
	'Jack Daniel',
	'Colonel Grant',
	'Johnnie Walker',
	'Mlle Jameson',
	'King Glenfiddich',
	'Prince Glenmorangie',
	'Miss Bourbon',
	'William Peel',
	'Ballantines',
	'Bill Boquet',
	'Michel Gagnant',
	'Hubert Bonisseur de la batte',
	'Alain Proviste',
	'Alex Terrieur',
	'Mac Adam',
	'Eva Poret',
	'Jacques Célert',
	'Jean Bambois',
	'Marie Rouana',
	'Octave Ergebelle',
	'Paul Ochon',
];
