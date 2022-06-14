import { TypeSprite, TypeTarget } from '../../interfaces/constantes';
import { Sprite } from './Sprite';
import spearfishing from '../../../../images/spearfishing.png';

export class InverseMove extends Sprite {
	constructor( width: number, height: number ) {
		super( width, height );
		this.color = '#FF00FF';
		this.typeTarget = TypeTarget.PLAYER;
		this.typeSprite = TypeSprite.INVERSEMOVE;
		this.imageParameter = new Image();
		this.imageParameter.src = spearfishing;
	}
}
