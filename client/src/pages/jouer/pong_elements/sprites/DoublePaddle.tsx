import { TypeTarget, TypeSprite } from '../../interfaces/constantes';
import { Sprite } from './Sprite';
import shell from '../../../../images/shell.png';
export class DoublePaddle extends Sprite {
	constructor( width: number, height: number ) {
		super( width, height );
		this.color = '#ff0000';
		this.typeTarget = TypeTarget.PLAYER;
		this.typeSprite = TypeSprite.DOUBLEPADDLE;
		this.imageParameter = new Image();
		this.imageParameter.src = shell;
	}
}
