import { Transition } from 'semantic-ui-react';
import { TJsxChildren } from '../globals/types';

namespace Transitions {
	interface ITransitionProps {
		children: TJsxChildren;
		visible: boolean;
		duration?: number;
	}

	export function Pulse( props: ITransitionProps ): JSX.Element {
		return (
			<Transition animation="pulse" duration={props.duration ? props.duration : 400} visible={props.visible}>
				{props.children}
			</Transition>
		);
	}

	export function Fade( props: ITransitionProps ): JSX.Element {
		return (
			<Transition animation="fade" duration={props.duration ? props.duration : 150} visible={props.visible}>
				{props.children}
			</Transition>
		);
	}

	export function FadeLeft( props: ITransitionProps ): JSX.Element {
		return (
			<Transition animation="fade left" duration={props.duration ? props.duration : 150} visible={props.visible}>
				{props.children}
			</Transition>
		);
	}
}

export default Transitions;
