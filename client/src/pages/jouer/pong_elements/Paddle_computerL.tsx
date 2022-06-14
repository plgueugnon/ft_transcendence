import { LeftRight } from '../interfaces/constantes';
import { Paddle } from './Paddle';
import { Paddle_computer } from './Paddle_computer';
import paddleLeft from '../../../images/paddle-left.png';
import halfFish from '../../../images/halfFishLeft.png';

export class Paddle_computerL extends Paddle_computer {
	constructor( height: number ) {
		super( Paddle.wallOffset, height / 2 - Paddle.height / 2, height );
		this.leftRight = LeftRight.LEFT;
		this.imageParameter = new Image();
		this.imageParameter.src = paddleLeft;
		this.imageDefault = paddleLeft;
		this.imageHalfPaddle = halfFish;
	}
}
