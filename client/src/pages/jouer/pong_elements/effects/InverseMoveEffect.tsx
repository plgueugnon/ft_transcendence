import { TypeSprite } from '../../interfaces/constantes';
import { Player } from '../Player';
import { Effect } from './Effects';

export class InverseMoveEffect extends Effect {
	constructor( player: Player ) {
		super( TypeSprite.INVERSEMOVE, player );
		this.time = 200;
	}

	activateEffect(): void {
		this.cible.inverseMove();
	}

	desactivateEffect(): void {
		this.cible.normalMove();
		this.setTime( 0 );
	}
}
