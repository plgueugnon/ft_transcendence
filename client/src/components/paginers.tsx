import React from 'react';

import { Icon, Grid } from 'semantic-ui-react';
import { useLocation } from 'react-router-dom';

import './paginers.css';

function GoToPage( page: string ) {
	const search = useLocation().search;
}

namespace Paginer {
	interface IPaginerRequiredProps {
		// copy optional to return button : default real return, when spec, href return
		value: number;
	}

	interface IPaginerOptionalProps {
		active: boolean;
	}

	interface IPaginerProps extends IPaginerRequiredProps, IPaginerOptionalProps { }

	const defaultProps: IPaginerOptionalProps = {
		active: false,
	};

	export function Basic( props: IPaginerProps ): JSX.Element {
		return (
			<Grid.Column>
				<div className={'pointer ' + ( props.active ? 'paginer-active' : 'paginer' )} onClick={() => GoToPage( props.value.toString() )}>
					{props.value}
				</div>
			</Grid.Column>
		);
	}
	Basic.defaultProps = defaultProps;

	export function Next(): JSX.Element {
		return (
			<Grid.Column>
				<div className="pointer paginer-active">
					{/* ON click read query or just go with passed */}
					<Icon name="arrow right" />
				</div>
			</Grid.Column>
		);
	}

	export function Prev(): JSX.Element {
		return (
			<Grid.Column>
				<div className="pointer paginer-acive">
					<Icon name="arrow left" />
				</div>
			</Grid.Column>
		);
	}

	export function Inter(): JSX.Element {
		return (
			<Grid.Column>
				<div className="pointer paginer">...</div>
			</Grid.Column>
		);
	}
}

export default Paginer;
