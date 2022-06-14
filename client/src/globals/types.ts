import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic';

//? TYPES

export type TJsxChildren = ( JSX.Element | string ) | ( string | JSX.Element )[];

export type TRequestMethods = 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH';

//? ITEM PROPS

export interface IDropdownItem {
	key: string | number;
	text: string;
	value: string;
}

export interface IMenuItem {
	path: string;
	name?: string;
	icon?: SemanticICONS;
}
