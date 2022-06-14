import './searchBars.css';

interface IResultatsProps {
	setValue: ( newValue: string ) => void;
	value: string;
	placeholder?: string;
}

function ResultatsSearchBar( props: IResultatsProps ) {
	return <input className="resultatsInput" type="text" placeholder={props.placeholder} value={props.value} onChange={( event ) => props.setValue( event.target.value )} />;
}

export { ResultatsSearchBar };
