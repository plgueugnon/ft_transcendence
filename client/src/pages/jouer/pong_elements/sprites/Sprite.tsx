import { TypeSprite, TypeTarget } from '../../interfaces/constantes';
import { Ball } from '../Ball';
import { Entity } from '../Entity';

export abstract class Sprite extends Entity {
	public static width = 20; //20
	public static height = 60;
	public static nbMaxSprite = 4;

	protected visible: boolean = true;
	public typeTarget: TypeTarget = TypeTarget.NOTHING;
	public typeSprite: TypeSprite = TypeSprite.NOTHING;
	private middleCanvas: number;

	constructor( width: number, height: number ) {
		super( Sprite.width, Sprite.height, width / 2 - Sprite.width / 2, 20, height );
		this.speed = 2;
		this.xVel = 0;
		this.yVel = 2;
		this.middleCanvas = width / 2 - Sprite.width / 2;
	}

	update( ball: Ball ) {
		if ( this.visible ) {
			if ( this.y + this.height >= this.heightCanvas && this.x === this.middleCanvas ) {
				this.xVel = +1;
				this.yVel = -2;
			} else if ( this.y <= 0 && this.x > this.middleCanvas ) {
				this.xVel = 0;
				this.yVel = +2;
			} else if ( this.y + this.height >= this.heightCanvas + 20 && this.x > this.middleCanvas + 20 ) {
				this.xVel = -2;
				this.yVel = -2;
			} else if ( this.y <= 0 && this.x === this.middleCanvas ) {
				this.xVel = 0;
				this.yVel = +2;
			} else if ( this.y + this.height >= this.heightCanvas && this.x < this.middleCanvas ) {
				this.xVel = +1;
				this.yVel = -2;
			} else if ( this.y <= 0 && this.x < this.middleCanvas - 20 ) {
				this.xVel = 0;
				this.yVel = +2;
			}
			this.y += this.yVel * this.speed;
			this.x += this.xVel * this.speed;

			if ( this.y < 0 )
				this.y = 0;
			if ( this.y > this.heightCanvas )
				this.y = this.heightCanvas;
		}
	}

	isVisible(): boolean {
		return this.visible;
	}

	enable() {
		this.visible = true;
	}

	disable() {
		this.visible = false;
	}

	draw( ctx: any ) {
		ctx.drawImage( this.imageParameter, this.x, this.y, this.imageParameter?.width, this.imageParameter?.height );
	}
}
