import { LeftRight } from '../interfaces/constantes';
import { Paddle } from './Paddle';
import paddleLeft from '../../../images/paddle-left.png';
import halfFish from '../../../images/halfFishLeft.png';

export class PaddleL extends Paddle {
	constructor( height: number ) {
		super( Paddle.wallOffset, height / 2 - Paddle.height / 2, false, height );
		this.leftRight = LeftRight.LEFT;
		this.imageParameter = new Image();
		this.imageParameter.src = paddleLeft;
		this.imageDefault = paddleLeft;
		this.imageHalfPaddle = halfFish;
		this.color = '#00ff00';
	}
}
