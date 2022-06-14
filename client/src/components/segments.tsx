import './segments.css';
import { TJsxChildren } from '../globals/types';

namespace Segments {
	export function BackgroundWhite( props: { children: TJsxChildren } ): JSX.Element {
		return <div className="white-default-segment">{props.children}</div>;
	}
}

export default Segments;
