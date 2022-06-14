import { TypeTarget } from '../interfaces/constantes';
import { FastBallEffect } from './effects/FastBallEffect';
import { Entity } from './Entity';
import Jeux from './Jeux';
import { Paddle } from './Paddle';
import { Sprite } from './sprites/Sprite';

export class Ball extends Entity {
	private widthGame: number;
	private heightGame: number;
	public static ballSize: number = 10;
	public static normalSpeed = 10;

	constructor( width: number, height: number ) {
		super( Ball.ballSize, Ball.ballSize, width / 2 - Ball.ballSize / 2, height / 2 - Ball.ballSize / 2, height );
		this.color = '#ffff00';
		this.widthGame = width;
		this.heightGame = height;
		this.speed = Ball.normalSpeed;
		var randomDirection = Math.floor( Math.random() * 2 ) + 1;
		if ( randomDirection % 2 )
			this.xVel = 1.8;
		else
			this.xVel = -1.8;

		randomDirection = Math.floor( Math.random() * 2 ) + 1;
		if ( randomDirection % 2 )
			this.yVel = 1.4; //vector horizontal
		else
			this.yVel = -1.4;
	}
	draw( context: any ): void {
		context.fillStyle = this.color;
		context.beginPath();
		context.arc( this.x, this.y, Ball.ballSize, 0, 2 * Math.PI );
		context.fill();
	}

	initBall() {
		this.x = this.widthGame / 2 - Ball.ballSize / 2;
		this.y = this.heightGame / 2 - Ball.ballSize / 2;
		var randomDirection = Math.floor( Math.random() * 2 ) + 1;

		if ( randomDirection % 2 )
			this.yVel = 1.4; //vector horizontal
		else
			this.yVel = -1.4;
	}

	update( game: Jeux ) {
		//check top canvas bounds
		if ( this.y - Ball.ballSize <= 10 && this.yVel < 0 ) {
			this.yVel *= -1;
		}

		//check bottom canvas bounds
		if ( this.y + Ball.ballSize >= game.height - 10 && this.yVel > 0 ) {
			this.yVel *= -1;
		}

		//check left canvas bounds
		if ( this.x - Ball.ballSize <= 10 ) {
			game.player2.score++;
			this.initBall();
			game.stop();
		}

		//check right canvas bounds
		if ( this.x + Ball.ballSize >= game.width - 10 ) {
			game.player1.score++;
			this.initBall();
			game.stop();
		}

		//check player left collision
		if ( this.xVel < 0 && this.x - Ball.ballSize <= game.player1.getPaddle().x + game.player1.getPaddle().width ) {
			if ( this.y + Ball.ballSize >= game.player1.getPaddle().y && this.y - Ball.ballSize <= game.player1.getPaddle().y + game.player1.getPaddle().height ) {
				this.rebound( game.player1.getPaddle() );
			}
		}

		//check right collision
		if ( this.xVel > 0 && this.x + Ball.ballSize >= game.player2.getPaddle().x ) {
			if ( this.y + Ball.ballSize >= game.player2.getPaddle().y && this.y - Ball.ballSize <= game.player2.getPaddle().y + game.player2.getPaddle().height ) {
				this.rebound( game.player2.getPaddle() );
			}
		}

		//check Sprite collision
		if ( Jeux.Bonus ) {
			for ( let i = 0; i < game.sprites?.length; i++ ) {
				if ( game.sprites[ i ] && game.sprites[ i ].isVisible() ) this.spriteColision( game.sprites[ i ], game );
			}
		}
		this.x += this.xVel * this.speed;
		this.y += this.yVel * this.speed;
		this.controle();
		//if(this.yVel  === 0) this.yVel = +1;

		if ( Jeux.Bonus )
			this.updateEffects();
	}

	private controle() {
		if ( this.y < 0 )
			this.y = 0;
	}

	private spriteColision( sprite: Sprite, game: Jeux ) {
		if ( this.x + Ball.ballSize >= sprite.x && this.x - Ball.ballSize <= sprite.x + sprite.width && this.y + Ball.ballSize >= sprite.y && this.y - Ball.ballSize <= sprite.y + sprite.height ) {
			//colision
			if ( sprite.typeTarget === TypeTarget.BALL )
				this.addEffect();
			else if ( sprite.typeTarget === TypeTarget.PLAYER ) {
				if ( this.xVel > 0 )
					//colision from left player
					game.player1.addEffect( sprite );
				else
					game.player2.addEffect( sprite );
			}
			this.xVel *= -1;
			sprite.disable();
		}
	}

	private pourcPaddle( paddle: Paddle ): number {
		/*
		Calcul du la portion de Paddle touchée:
			[] -1 %
			[]
			[]
			[] 0
			[]
			[]
			[] 1 %
		*/
		let pourc: number = 0;
		const halfPaddle = paddle.height / 2;
		const posMiddlePaddle = paddle.y + halfPaddle;
		pourc = ( this.y - posMiddlePaddle ) / halfPaddle;
		return pourc;
	}

	private rebound( paddle: Paddle ) {
		let pourc = this.pourcPaddle( paddle );
		this.xVel *= -1;
		if ( Math.abs( pourc ) >= 2 / 3 )
			//effet de coup sur les bords inversion du vecteur y
			this.yVel *= -1;
		if ( Math.abs( pourc ) >= 0.9 )
			// sur les bords grosse augmentation du vecteur y
			pourc *= 2;
		if ( Math.abs( pourc ) <= 1 / 3 )
			this.yVel = pourc; //coup vers le centre diminution du vecteur y
		else
			this.yVel += pourc; //coup sur les bords augmentation du vecteur y
	}

	private addEffect() {
		if ( this.effects.length === 0 ) {
			this.effects.push( new FastBallEffect( this ) );
		} else {
			this.effects[ 0 ].continue();
		}
	}
}
