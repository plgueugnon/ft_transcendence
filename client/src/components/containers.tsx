import { Container, Grid } from 'semantic-ui-react';

import './container.css';
import { TJsxChildren } from '../globals/types';

namespace Containers {
	interface PageProps {
		children: TJsxChildren;
		noScroll?: boolean; // deprec
	}

	/**
	 * Page()
	 * Default container for all page contents insert place for menu
	 */
	export function Page( props: PageProps ): JSX.Element {
		return <Container className={'page-container' + ( props.noScroll ? ' no-overflow ' : '' )}>{props.children}</Container>;
	}

	/**
	 * FullScreen()
	 * Explicit
	 */
	export function FullScreen( props: PageProps ): JSX.Element {
		return <div className={'full-screen-container' + ( props.noScroll ? ' no-overflow ' : '' )}>{props.children}</div>;
	}

	/**
	 * Centered()
	 * Used for centered small elements such as login boxes
	 */
	export function Centered( props: PageProps ): JSX.Element {
		return (
			<Container className={'page-container' + ( props.noScroll ? ' no-overflow ' : '' )}>
				<Grid textAlign="center" style={{ height: '60vh' }} verticalAlign="middle">
					<Grid.Column style={{ maxWidth: 450 }}>{props.children}</Grid.Column>
				</Grid>
			</Container>
		);
	}

	/**
	 * NoScroll()
	 * Keeps the user from scrolling
	 */
	export function NoScroll( props: { children: TJsxChildren } ): JSX.Element {
		return <div className="no-overflow">{props.children}</div>;
	}
}

export default Containers;
