import { TypeSprite } from '../../interfaces/constantes';
import { Player } from '../Player';
import { Effect } from './Effects';

export class HalfPaddleEffect extends Effect {
	constructor( player: Player ) {
		super( TypeSprite.HALFPADDLE, player );
		this.time = 200;
	}

	activateEffect(): void {
		this.cible.getPaddle().halfHeight();
	}

	desactivateEffect(): void {
		this.cible.getPaddle().restore();
	}
}
