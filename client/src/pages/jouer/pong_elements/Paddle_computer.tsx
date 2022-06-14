import { LeftRight } from '../interfaces/constantes';
import { Ball } from './Ball';
import { Paddle } from './Paddle';

export class Paddle_computer extends Paddle {
	constructor( x: number, y: number, height: number ) {
		super( x, y, true, height );
		this.speed = 30;
	}

	update( ball: Ball ) {
		if ( this.leftRight === LeftRight.RIGHT ) {
			if ( ball.xVel > 0 ) {
				if ( ball.y < this.y && this.y > 20 )
					this.yVel = -1;
				else if ( ball.y > this.y + this.height && this.y + this.height < this.heightCanvas - 20 )
					this.yVel = +1;
			} else
				this.yVel = 0;
		} else {
			if ( ball.xVel < 0 ) {
				if ( ball.y < this.y && this.y > 20 )
					this.yVel = -1;
				else if ( ball.y > this.y + this.height && this.y + this.height < this.heightCanvas - 20 )
					this.yVel = +1;
			} else
				this.yVel = 0;
		}
		this.y += this.yVel * this.speed;
		this.yVel = 0;
	}
}
