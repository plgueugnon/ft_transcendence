import { TypeSprite } from '../../interfaces/constantes';
import { Player } from '../Player';
import { Effect } from './Effects';

export class DoublePaddleEffect extends Effect {
	constructor( player: Player ) {
		super( TypeSprite.DOUBLEPADDLE, player );
		this.time = 200;
	}

	activateEffect(): void {
		this.cible.getPaddle().doubleHeight();
	}

	desactivateEffect(): void {
		this.cible.getPaddle().restore();
	}
}
