import { TypeTarget, TypeSprite } from '../../interfaces/constantes';
import { Ball } from '../Ball';
import { Sprite } from './Sprite';
import rocket from '../../../../images/rocket.png';

export class FastBall extends Sprite {
	constructor( width: number, height: number, ball: Ball ) {
		super( width, height );
		this.color = '#00ee60';
		this.speed = 10;
		this.typeTarget = TypeTarget.BALL;
		this.typeSprite = TypeSprite.FASTBALL;
		this.imageParameter = new Image();
		this.imageParameter.src = rocket;
	}
}
