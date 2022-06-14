import { TypeSprite, TypeTarget } from '../../interfaces/constantes';
import { Sprite } from './Sprite';
import crabe from '../../../../images/crab.png';
export class HalfPaddle extends Sprite {
	constructor( width: number, height: number ) {
		super( width, height );
		this.color = '#0000ff';
		this.typeTarget = TypeTarget.PLAYER;
		this.typeSprite = TypeSprite.HALFPADDLE;
		this.imageParameter = new Image();
		this.imageParameter.src = crabe;
	}
}
