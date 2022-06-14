import './text.css';
import { TJsxChildren } from '../globals/types';

namespace Text {
	interface IChildProps {
		children: TJsxChildren;
		className?: string;
	}

	export function PageTitle( props: IChildProps ): JSX.Element {
		return <div className={'page-title ' + props.className}>{props.children}</div>;
	}

	export function PageSubtitle( props: IChildProps ): JSX.Element {
		return <div className={'page-subtitle ' + props.className}>{props.children}</div>;
	}

	export function FormTitle( props: IChildProps ): JSX.Element {
		return <div className={'form-title ' + props.className}>{props.children}</div>;
	}

	export function FormSubtitle( props: IChildProps ): JSX.Element {
		return <div className={'form-subtitle ' + props.className}>{props.children}</div>;
	}

	export function Paragraph( props: IChildProps ): JSX.Element {
		return <div className={'paragraph ' + props.className}>{props.children}</div>;
	}
}

export default Text;
