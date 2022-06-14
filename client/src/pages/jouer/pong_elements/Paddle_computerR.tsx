import { LeftRight } from '../interfaces/constantes';
import { Paddle } from './Paddle';
import { Paddle_computer } from './Paddle_computer';
import paddleRight from '../../../images/paddle-right.png';
import halfFish from '../../../images/halfFishRight.png';

export class Paddle_computerR extends Paddle_computer {
	constructor( width: number, height: number ) {
		super( width - ( Paddle.wallOffset + Paddle.width ), height / 2 - Paddle.height / 2, height );
		this.leftRight = LeftRight.RIGHT;
		this.imageParameter = new Image();
		this.imageParameter.src = paddleRight;
		this.imageDefault = paddleRight;
		this.imageHalfPaddle = halfFish;
	}
}
