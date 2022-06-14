import { useEffect, useState } from 'react';

import './tabs.css';
import { TJsxChildren } from '../globals/types';
import { sleep } from '../globals/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form } from 'semantic-ui-react';
import { useKeyPress } from '../hooks/useKeyPress';

export interface ITab {
	content: TJsxChildren;
	onEnter: Function;
	onLeave: Function;
}

namespace Tabs {
	interface ISlideProps {
		children: TJsxChildren;
		tabKey: number;
		activeTab: number;
		className?: string;
	}

	export function Slide( props: ISlideProps ): JSX.Element {
		const [ status, setStatus ] = useState<string>( 'tab-slide-right' );
		const [ display, setDisplay ] = useState<string>( 'display' );
		const sleepTime = 150;

		//* On active tab change
		// Execute switch
		useEffect( () => {
			// If active set to current, wait a bit then put to view
			if ( props.tabKey === props.activeTab ) {
				sleep( sleepTime ).then( () => {
					setDisplay( 'display' );
					sleep( sleepTime / 2 ).then( () => {
						setStatus( 'tab-active' );
					} );
				} );
			}
			// If
			else if ( props.tabKey > props.activeTab ) {
				setStatus( 'tab-slide-right' );
				sleep( sleepTime ).then( () => setDisplay( 'tab-no-display' ) );
			} else {
				setStatus( 'tab-slide-left' );
				sleep( sleepTime ).then( () => setDisplay( 'tab-no-display' ) );
			}
		}, [ props.activeTab ] );

		useEffect( () => { } );

		return <div className={'tab-main ' + status + ' ' + props.className + ' ' + display}>{props.children}</div>;
	}

	interface IControllerProps {
		tabs: ITab[];
		// Optional
		onValidate?: Function; // on press enter in the last slide
		hideButtons?: boolean;
		activeTab?: number;
	}

	export function Controller( props: IControllerProps ): JSX.Element {
		//? HOOKS
		// Navigation
		const location = useLocation();
		const navigate = useNavigate();
		// Slides
		const [ activeTab, setActiveTab ] = useState<number>( 0 );
		// Keyboard
		const enterPress = useKeyPress( 'Enter' );

		//* On param change
		useEffect( () => {
			const newTab = parseInt( location.hash.substring( 1 ) ); // substring to remove '#'

			if ( newTab >= 0 && newTab < props.tabs.length ) {
				// Excute 'onLeave' tab actions
				if ( props.tabs[ activeTab ].onLeave )
					props.tabs[ activeTab ].onLeave();
				setActiveTab( newTab );
				// Excute 'onEnter' tab actions
				if ( props.tabs[ newTab ].onEnter )
					props.tabs[ newTab ].onEnter();
			}
		}, [ location ] );

		//* On props.currentTab change
		useEffect( () => {
			if ( props.activeTab )
				changeTab( props.activeTab );
		}, [ props.activeTab ] );

		//* On Enter press
		// If we can, go to next tab, else if it is defined call onValidate
		useEffect( () => {
			if ( !enterPress )
				return;

			if ( activeTab !== props.tabs.length - 1 )
				handleClick( 'next' );
			else if ( props.onValidate )
				props.onValidate();
		}, [ enterPress ] );

		//? ACTIONS

		const changeTab = ( newTab: number ) => {
			navigate( location.pathname + location.search + '#' + newTab.toString() );
		};

		const handleClick = ( direction: 'prev' | 'next' ) => {
			if ( direction === 'prev' )
				changeTab( activeTab - 1 );
			else
				changeTab( activeTab + 1 );
		};

		//? RENDER

		return (
			<>
				{props.tabs.map( ( element, index ) => (
					<Slide tabKey={index} activeTab={activeTab} key={index}>
						{element.content}
					</Slide>
				) )}

				{activeTab !== 0 ? ( // Icon not aligned
					<Form.Button floated="left" size="big" icon="angle left" circular basic color="black" onClick={() => handleClick( 'prev' )} />
				) : (
					<></>
				)}
				{activeTab !== props.tabs.length - 1 ? <Form.Button floated="right" size="big" icon="angle right" circular basic color="black" onClick={() => handleClick( 'next' )} /> : <></>}
			</>
		);
	}
}

export default Tabs;
