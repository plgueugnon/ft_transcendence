import { TypeSprite } from '../interfaces/constantes';
import { Effect } from './effects/Effects';
export class Entity {
	width: number;
	height: number;
	x: number;
	y: number;
	xVel: number = 0;
	yVel: number = 0;
	speed: number = 0;
	color: string = '#ffffff';
	heightCanvas: number;
	protected imageParameter?: HTMLImageElement;
	protected effects: Effect[] = [];

	constructor( w: number, h: number, x: number, y: number, hCanvas: number ) {
		this.width = w;
		this.height = h;
		this.x = x;
		this.y = y;
		this.heightCanvas = hCanvas;
	}

	draw( context: any ) {
		context.fillStyle = this.color;
		context.fillRect( this.x, this.y, this.width, this.height );
	}

	setColor( color: string ) {
		this.color = color;
	}

	setSpeed( speed: number ) {
		this.speed = speed;
	}

	updateEffects() {
		for ( let i = 0; i < this.effects.length; i++ ) {
			if ( !this.effects[ i ].finished() ) this.effects[ i ].run();
		}
		for ( let i = 0; i < this.effects.length; i++ ) {
			if ( this.effects[ i ].finished() ) {
				this.effects[ i ].desactivateEffect();
				delete this.effects[ i ];
				this.effects.splice( i, 1 );
			}
		}
	}

	allreadyEffect( type: TypeSprite ): number {
		for ( let i = 0; i < this.effects.length; i++ ) {
			if ( this.effects[ i ].getType() === type )
				return i;
		}
		return -1;
	}
}
