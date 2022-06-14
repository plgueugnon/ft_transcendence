/**
 * randString()
 * @param size size of the string
 * @returns a randomly generated string
 */
export function randString( size: number ): string {
	if ( size <= 0 )
		return '';

	let charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	// Pick characers randomly
	let str: string = '';
	for ( let i: number = 0; i < size; ++i ) {
		str += charset.charAt( Math.floor( Math.random() * charset.length ) );
	}
	return str;
}

/**
 * randNum()
 * @param size size of the string
 * @returns a randomly generated num string
 */
export function randNum( size: number ): string {
	if ( size <= 0 )
		return '';

	let charset: string = '0123456789';
	// Pick characers randomly
	let str: string = '';
	for ( let i: number = 0; i < size; ++i ) {
		str += charset.charAt( Math.floor( Math.random() * charset.length ) );
	}
	return str;
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
