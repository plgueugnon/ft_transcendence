import leftShape from '../images/resultsTopLeft.png';
import rightShape from '../images/resultsTopRight.png';
import './vectors.css';

/**
 * VectorsShapeA
 * Design element in the backgroud of the Results pages
 */
export function VectorsShapeA(): JSX.Element {
	return (
		<div className="noselect">
			<img src={leftShape} className="left-shape" alt="" />
			<img src={rightShape} className="right-shape" alt="" />
		</div>
	);
}
