import { LeftRight, TypeSprite } from '../interfaces/constantes';
import { Ball } from './Ball';
import { DoublePaddleEffect } from './effects/DoublePaddleEffect';
import { HalfPaddleEffect } from './effects/HalfPaddleEffect';
import { InverseMoveEffect } from './effects/InverseMoveEffect';
import { Entity } from './Entity';
import { Paddle } from './Paddle';
import { PaddleL } from './PaddleL';
import { PaddleR } from './PaddleR';
import { Paddle_computerL } from './Paddle_computerL';
import { Paddle_computerR } from './Paddle_computerR';
import { Sprite } from './sprites/Sprite';

export class Player extends Entity {
	private paddle: Paddle;
	public score: number = 0;
	private position: LeftRight;

	constructor( computer: boolean, lr: number, width: number, height: number ) {
		super( width, height, 0, 0, height );
		this.position = lr;
		this.speed = 10;
		if ( this.position === LeftRight.LEFT ) {
			if ( computer )
				this.paddle = new Paddle_computerL( height );
			else
				this.paddle = new PaddleL( height );
		} else {
			if ( computer )
				this.paddle = new Paddle_computerR( width, height );
			else
				this.paddle = new PaddleR( width, height );
		}
	}
	update( ball: Ball ) {
		if ( this.paddle.isComputer() )
			this.paddle.update( ball );
		this.updateEffects();
	}

	releaseKey() {
		this.paddle.yVel = 0;
	}

	draw( ctx: any ) {
		if ( ctx )
			this.paddle.draw( ctx );
	}

	inverseMove() {
		this.paddle.inverseMove();
	}

	normalMove() {
		this.paddle.normalMove();
	}

	getScore(): number {
		return this.score;
	}

	point() {
		this.score++;
	}

	getPaddle(): Paddle {
		return this.paddle;
	}

	isComputer(): boolean {
		return this.paddle.isComputer();
	}

	setColorPaddle( color: string ) {
		this.paddle.setColor( color );
	}
	setScore( score: number ) {
		this.score = score;
	}

	addEffect( sprite: Sprite ) {
		let allready: number = this.allreadyEffect( sprite.typeSprite );
		switch ( sprite.typeSprite ) {
			case TypeSprite.DOUBLEPADDLE:
				if ( allready === -1 )
					this.effects.push( new DoublePaddleEffect( this ) );
				else
					this.effects[ allready ].continue();
				break;
			case TypeSprite.HALFPADDLE:
				if ( allready === -1 )
					this.effects.push( new HalfPaddleEffect( this ) );
				else
					this.effects[ allready ].continue();
				break;
			case TypeSprite.INVERSEMOVE:
				if ( allready === -1 )
					this.effects.push( new InverseMoveEffect( this ) );
				else
					this.effects[ allready ].desactivateEffect();
				break;
			default:
		}
	}
}
