import { IDropdownItem } from './types';

export const SPLIT_KEY = ', ';

/**
 * sleep()
 * @param ms time to wait in millisecond
 * @returns a Promise resolving itself ms milliseconds after call
 */
export function sleep( ms: number ): Promise<void> {
	return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}

/**
 * rand()
 * @param valueMin
 * @param valueMax
 * @returns returns a random value between and including @valueMin and @valueMax
 */
export function rand( valueMin: number, valueMax: number ): number {
	if ( valueMin >= valueMax )
		return valueMin;
	else
		return Math.floor( valueMin + Math.random() * ( valueMax - valueMin ) );
}

/**
 * randString()
 * @param size size of the string
 * @returns a randomly generated string
 */
export function randString( size: number ): string {
	if ( size <= 0 )
		return '';

	let chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	// Pick characers randomly
	let str: string = '';
	for ( let i: number = 0; i < size; ++i ) {
		str += chars.charAt( Math.floor( Math.random() * chars.length ) );
	}
	return str;
}

/**
 * getItemsByTab()
 * @param tab array of strings to be turn into array.
 * Returns an IDropdownItem array filled with every string from @tab
 */
export function getItemsByTab( tab: string[] ): IDropdownItem[] {
	let items: IDropdownItem[] = [];
	tab.forEach( ( str ) => {
		const newItem: IDropdownItem = {
			key: str,
			text: str,
			value: str,
		};
		items.push( newItem );
	} );
	return items;
}

/**
 * getItemsByTab()
 * @param str string of ", " separed elements to be turn into array.
 * Returns an IDropdownItem array filled with every elements from @str using getItemsByTab()
 */
export function getItemsByString( str: string ): IDropdownItem[] {
	return getItemsByTab( str.split( SPLIT_KEY ) );
}

/**
 * getTime function
 * retourne la date sous ce format :
 * Envoye le : 12/12/2018 à 12:12:12
 */
export function timeStampToString( date: Date ): string {
	let currentDate: Date = date;
	let cDay: number = currentDate.getDate();
	let cMonth: number = currentDate.getMonth() + 1;
	let cYear: number = currentDate.getFullYear();
	let cHour: number = currentDate.getHours();
	let cMinute: number = currentDate.getMinutes();
	let cSecond: number = currentDate.getSeconds();

	// Renvoie au format string la date + heure
	let now: string = '';

	now += ( cDay < 10 ? '0' : '' ) + cDay + '/';
	now += ( cMonth < 10 ? '0' : '' ) + cMonth + '/';
	now += ( cYear < 10 ? '0' : '' ) + cYear + ' à ';
	now += ( cHour < 10 ? '0' : '' ) + cHour + ':';
	now += ( cMinute < 10 ? '0' : '' ) + cMinute + ':';
	now += ( cSecond < 10 ? '0' : '' ) + cSecond;
	// now = "Envoyé le " + now;
	return now;
}

/**
 * Add Minutes to Actual Date and return it for ban and mute timestamp
 * @param minutes
 * @returns Actual time + @minutes
 */
export function addTime( minutes: number ): Date {
	let currentDateObj = new Date();
	let numberOfMlSeconds = currentDateObj.getTime();
	let addMlSeconds = 60 * minutes * 1000;
	let newTimeStamp = new Date( numberOfMlSeconds + addMlSeconds );
	return newTimeStamp;
}

/**
 * switchBool()
 * @param value
 * @return Inverted value of given boolean
 */
export function switchBool( value: boolean ): boolean {
	if ( value )
		return false;
	else
		return true;
}
