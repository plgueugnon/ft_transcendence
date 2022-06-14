import { randString } from './utils';

// PATH RELATED

export const APP_LOGIN_REDIRECT_PATH = '/sg-login';
export const APP_PROFILE_PATH = '/profile';
export const APP_USER_CREATION_QUERY = '?create';
export const APP_USER_CREATION_PATH = APP_PROFILE_PATH + APP_USER_CREATION_QUERY;
export const APP_USER_EDITION_QUERY = '?edit';
export const APP_USER_EDITION_PATH = APP_PROFILE_PATH + APP_USER_EDITION_QUERY;
export const APP_PLAY_PATH = '/jouer';
export const APP_2FA_PATH = '/toureiffel';
export const APP_USER_SEARCH_PATH = '/users';
export const APP_LEADERBOARD_PATH = '/leaderboard';
export const APP_UNAUTHORIZED_PATH = '/pasledroit';
export const APP_ERROR_PATH = '/error';

// URL RELATED

export const APP_URL = 'http://localhost';
export const FRONT_URL = APP_URL + ':3000';
export const API_URL = APP_URL + ':5001';
export const FT_API_URL = 'https://api.intra.42.fr';
export const APP_LOGIN_REDIRECT_URL = FRONT_URL + APP_LOGIN_REDIRECT_PATH;
export const APP_USER_CREATION_URL = FRONT_URL + APP_USER_CREATION_PATH;
export const APP_ERROR_URL = FRONT_URL + APP_ERROR_PATH;

export const DEFAULT_AVATARS_PATH = FRONT_URL + '/images/default_avatars/';
export const DEFAULT_SQUARE_IMAGE_URL = 'https://react.semantic-ui.com/images/wireframe/square-image.png';
export const APP_COOKIE_NAME = 'sgUserData';
export const APP_TMP_COOKIE_NAME = 'sgTmpUserLogin';
export const SEMANTIC_ICON_LOADING = 'circle notched';
export const SEMANTIC_ICON_DEFAULT_USER = 'user circle';

// API RELATED

export const RAN_OAUTH_STATE = randString( 16 );
export const TWOFA_CODE_LENGTH = 6;
export const FT_API_UID = '91b2b81f73519d89d292494f711902754aa313aae288325cd85d57f78c47d353';
export const APP_TIME_BEFORE_TIMEOUT = 15000;

// CONTENT

export const MESSAGE_INVITE_FORMAT = '-----INVITE-----';
export const ACTION_TAG_INVITE_FROM_CHAT = 'action';
export const REDIRECT_LOGIN_INVITE_FROM_CHAT = 'login';
export const REDIRECT_VALUE_INVITE = 'invite';
export const REDIRECT_VALUE_JOIN = 'join';
export const BUTTON_LOADING_NAME = 'loading';
export const APP_CUSTOM_UPLOAD_NAME = 'custom';
export const USERNAME_MAX_LENGTH = 20;
export const CHANNELNAME_MAX_LENGTH = 30;
export const PASSWORD_MAX_LENGTH = 30;
export const MESSAGE_MAX_LENGTH = 250;
export const MESSAGES_LIFETIME = 1000 * 5;

export const DEFAULT_AVATARS_TAB: string[] = [
	DEFAULT_AVATARS_PATH + 'default_0.png',
	DEFAULT_AVATARS_PATH + 'default_1.png',
	DEFAULT_AVATARS_PATH + 'default_2.png',
	DEFAULT_AVATARS_PATH + 'default_3.png',
	DEFAULT_AVATARS_PATH + 'default_4.png',
	DEFAULT_AVATARS_PATH + 'default_5.png',
];

export const DEFAULT_NAME_BY_LOGIN: string[][] = [
	[ 'clucien', 'CEO at Gucci' ],
	[ 'pgueugno', 'Big Peat' ],
	[ 'ygeslin', 'CTO at Freelance' ],
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
