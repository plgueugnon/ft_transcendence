import { LeftRight } from '../interfaces/constantes';
import { Paddle } from './Paddle';
import paddleRight from '../../../images/paddle-right.png';
import halfFish from '../../../images/halfFishRight.png';

export class PaddleR extends Paddle {
	constructor( width: number, height: number ) {
		super( width - ( Paddle.wallOffset + Paddle.width ), height / 2 - Paddle.height / 2, false, height );
		this.leftRight = LeftRight.RIGHT;
		this.imageParameter = new Image();
		this.imageParameter.src = paddleRight;
		this.imageDefault = paddleRight;
		this.imageHalfPaddle = halfFish;
	}
}
