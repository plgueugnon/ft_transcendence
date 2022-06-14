import { TJsxChildren } from '../globals/types';

import './segmentFilters.css';

export namespace SegmentFilter {
	interface IDefaultProps {
		title: string;
		children: TJsxChildren;
	}

	export function Default( props: IDefaultProps ): JSX.Element {
		return (
			<div className="filter-main">
				<div className="filter-content">
					<div className="filter-title">{props.title}</div>
					<div className="filter-children">{props.children}</div>
				</div>
			</div>
		);
	}

	interface IButtonProps {
		children: TJsxChildren;
	}

	export function Button( props: IButtonProps ): JSX.Element {
		return (
			<div className="filter-main">
				<div className="filter-content">
					<div className="filter-button-text">{props.children}</div>
				</div>
			</div>
		);
	}
}
