import { TJsxChildren } from './types';

export interface IChildrenProps {
	children: TJsxChildren;
}

export interface INotif {
	title: string;
	content: string;
	type: 'info' | 'warning' | 'error' | 'success';
	// Setted by context
	createdAt?: number;
}
