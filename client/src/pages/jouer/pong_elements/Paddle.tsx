import { LeftRight, Size } from '../interfaces/constantes';
import { Ball } from './Ball';
import { Entity } from './Entity';
import Jeux from './Jeux';

export abstract class Paddle extends Entity {
	private computeur: boolean = false;
	private normalMovement: boolean = true;
	protected leftRight: number = LeftRight.LEFT;
	protected size: number = Size.NORMAL;
	protected imageDefault: string = '';
	protected imageHalfPaddle: string = '';
	public static width = 20;
	public static height = 110;
	public static wallOffset = 20;

	constructor( x: number, y: number, computer: boolean, height: number ) {
		super( Paddle.width, Paddle.height, x, y, height );
		this.computeur = computer;
		this.color = '#f0f';
		this.speed = 10;
	}

	move( y: number ) {
		let newY;
		if ( !this.normalMovement )
			y = this.heightCanvas - y;
			// * newY + 55 to avoid the paddle to be out of the canvas
		if (this.size === Size.DOUBLE)
			newY = ( y * 600 ) / this.heightCanvas - this.height / 2 - 110;
		else if (this.size === Size.HALF)
			newY = ( y * 600 ) / this.heightCanvas - this.height / 2 - 28;
		else
			newY = ( y * 600 ) / this.heightCanvas - this.height / 2 - 55;
		this.y = this.control( newY );
	}

	normalMove() {
		this.normalMovement = true;
	}

	inverseMove() {
		this.normalMovement = false;
	}

	isComputer(): boolean {
		return this.computeur;
	}

	update( ball: Ball ) {
		//
	}

	restore() {
		this.imageParameter!.src = this.imageDefault;
		this.height = Paddle.height;
		this.width = Paddle.width;
		this.size = Size.NORMAL;
	}

	doubleHeight() {
		if ( this.size === Size.NORMAL ) {
			this.height *= 2;
			this.width *= 2;
			this.size = Size.DOUBLE;
		} else if ( this.size === Size.HALF ) {
			this.restore();
		}
	}

	halfHeight() {
		if ( this.size === Size.NORMAL ) {
			this.height /= 2;
			this.imageParameter!.src = this.imageHalfPaddle;
			this.size = Size.HALF;
		} else if ( this.size === Size.DOUBLE ) {
			this.restore();
		}
	}

	draw( ctx: any ) {
		if ( Jeux.Bonus )
			ctx.drawImage( this.imageParameter, this.x, this.y, this.width, this.height );
		else {
			ctx.fillStyle = this.color;
			ctx.fillRect( this.x, this.y, this.width, this.height );
		}
	}

	getSize(): Size {
		return this.size;
	}

	setSize( size: Size ) {
		if ( size === Size.HALF ) {
			this.halfHeight();
		} else if ( size === Size.DOUBLE ) {
			this.doubleHeight();
		} else
			this.restore();
	}

	private control( newY: number ): number {
		if ( newY < 0 )
			return 0;
		return newY;
	}
}
