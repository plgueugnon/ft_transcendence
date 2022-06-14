import { TypeSprite } from '../../interfaces/constantes';
import { Ball } from '../Ball';
import { Effect } from './Effects';

export class FastBallEffect extends Effect {
	constructor( ball: Ball ) {
		super( TypeSprite.FASTBALL, ball );
		this.time = 200;
	}

	activateEffect() {
		this.cible.setSpeed( 15 );
	}

	desactivateEffect() {
		this.cible.setSpeed( Ball.normalSpeed );
	}
}
