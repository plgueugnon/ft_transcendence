import { TypeSprite } from '../../interfaces/constantes';
import { Ball } from '../Ball';
import { Player } from '../Player';

export abstract class Effect {
	public static Time: number = 500;
	protected type: TypeSprite;
	protected cible: Player | Ball | any;
	protected time: number;

	private finish: boolean = false;

	constructor( t: TypeSprite, c: Player | Ball ) {
		this.type = t;
		this.cible = c;
		this.time = Effect.Time;
		this.activateEffect();
	}

	public continue() {
		this.time += Effect.Time;
	}

	run() {
		this.time--;
		if ( this.time <= 0 )
			this.finish = true;
	}

	finished(): boolean {
		return this.finish;
	}

	getType(): TypeSprite {
		return this.type;
	}

	setTime( t: number ): void {
		this.time = t;
		if ( this.time <= 0 )
			this.finish = true;
	}

	abstract desactivateEffect(): void;

	abstract activateEffect(): void;
}
