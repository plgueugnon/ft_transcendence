import { IGame } from '../interfaces/gameInterface';
import { Ball } from './Ball';
import { Player } from './Player';
import { DoublePaddle } from './sprites/DoublePaddle';
import { FastBall } from './sprites/FastBall';
import { HalfPaddle } from './sprites/HalfPaddle';
import { Sprite } from './sprites/Sprite';
import { LeftRight, Status, TypeSprite, User } from '../interfaces/constantes';
import { InverseMove } from './sprites/InverseMove';
import background from '../../../images/wave_background-pong.jpg';
import { Paddle } from './Paddle';

class Jeux {
	public static MaxPoint = 10;
	public static Bonus: boolean = false;

	private ball: Ball;
	public player1: Player;
	public player2: Player;
	public sprites: Sprite[] = [];

	public width: number; //width Canvas
	public height: number; //height Canvas

	public status: Status;
	public info: string;
	private color_court_out_line = '#404040';
	private color_surface = '#000000'; //A6C9FC
	private color_line_center = '#FFFFFF';
	private imageParameter?: HTMLImageElement;

	private thumbnail: boolean;
	private user: User;

	constructor( w: number, h: number, user: User, training: boolean, bonus: boolean = false ) {
		this.width = w;
		this.height = h;
		this.user = user;
		Jeux.Bonus = bonus;
		if ( Jeux.Bonus ) {
			Paddle.width = 51;
			Paddle.height = 110;
		} else {
			Paddle.width = 20;
			Paddle.height = 110;
		}
		this.ball = new Ball( this.width, this.height );
		this.player1 = new Player( false, LeftRight.LEFT, this.width, this.height );
		training ? ( this.player2 = new Player( true, LeftRight.RIGHT, this.width, this.height ) ) : ( this.player2 = new Player( false, LeftRight.RIGHT, this.width, this.height ) );
		if ( this.user === User.WATCHER )
			this.info = '';
		else
			this.info = 'Enter to start';
		this.thumbnail = false;
		this.status = Status.WAITING;
		this.imageParameter = new Image();
		this.imageParameter.src = background;
	}

	update() {
		this.player1.update( this.ball );
		this.player2.update( this.ball );
		if ( Jeux.Bonus )
			this.updateSprite();
		if ( this.status === Status.STARTING ) {
			this.ball.update( this );
			if ( this.winner() > 0 ) {
				this.status = Status.FINISH;
			}
		}
	}

	private updateSprite() {
		for ( let i = 0; i < this.sprites?.length; i++ ) {
			if ( this.sprites[ i ] && this.sprites[ i ].isVisible() )
				this.sprites![ i ].update( this.ball );
			if ( this.sprites[ i ] && !this.sprites[ i ].isVisible() ) {
				delete this.sprites[ i ];
				this.sprites.splice( i, 1 );
			}
		}
	}

	starting() {
		if ( this.status === Status.WAITING ) {
			this.info = '';
			this.status = Status.STARTING;
		}
	}

	stop() {
		this.status = Status.WAITING;
		this.info = 'Enter to start';
	}

	/****************************************************************
	 *                  P A D D L E    M O V E M E N T
	 *****************************************************************/

	movePlayer1( y: number, heightCanvas: number ) {
		this.player1.getPaddle().heightCanvas = heightCanvas;
		this.player1.getPaddle().move( y );
	}

	movePlayer2( y: number, heightCanvas: number ) {
		this.player2.getPaddle().heightCanvas = heightCanvas;
		this.player2.getPaddle().move( y );
	}

	/*****************************************************************
	 *          D I S P L A Y    &    D R A W I N G
	 *****************************************************************/

	display( ctx: CanvasRenderingContext2D | null ) {

		this.drawBoardDetails( ctx );
		this.player1.draw( ctx );
		this.player2.draw( ctx );
		this.ball.draw( ctx );
		if ( Jeux.Bonus )
			this.displaySprites( ctx );
		this.putInfo( ctx );
	}

	private displaySprites( ctx: CanvasRenderingContext2D | null ) {
		for ( let i = 0; i < this.sprites?.length; i++ ) {
			if ( this.sprites[ i ] && this.sprites[ i ].isVisible() )
				this.sprites![ i ].draw( ctx );
		}
	}

	drawBoardDetails( ctx: any ) {
		const lineWidth = 5;
		if ( ctx ) {
			// surface
			ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

			if ( Jeux.Bonus )
				//image
				ctx.drawImage( this.imageParameter, 0, 0, this.width, this.height );
			else {
				// fond uni
				ctx.fillStyle = this.color_surface;
				ctx.fillRect( 0, 0, this.width, this.height );
			}

			//draw court outline
			ctx.strokeStyle = this.color_court_out_line;
			ctx.lineWidth = lineWidth;
			ctx.strokeRect( 10, 10, this.width - 20, this.height - 20 );

			//draw center lines
			for ( var i = 10; i + 30 < this.height; i += 30 ) {
				ctx.fillStyle = this.color_line_center;
				ctx.fillRect( this.width / 2 - 10, i + 10, 15, 20 );
			}
		} else {
			console.log( 'no ctx' );
		}
	}

	/***************************************************************
	 *                              I N F O
	 ***************************************************************/
	winner(): number {
		let win: number = 0;
		if ( this.player1.getScore() > this.player2.getScore() && this.player1.getScore() >= Jeux.MaxPoint )
			win = 1;
		else if ( this.player2.getScore() > this.player1.getScore() && this.player2.getScore() >= Jeux.MaxPoint )
			win = 2;
		return win;
	}

	isRunning(): boolean {
		return this.status === Status.STARTING;
	}

	setInfo( str: string ) {
		this.info = str;
	}

	putInfo( ctx: CanvasRenderingContext2D | null ) {
		if ( this.info.length > 0 && ctx ) {
			const posX = this.width / 2;
			const posY = this.height / 2;
			ctx.font = 'bold 50px Work Sans';
			ctx.fillStyle = '#FFFFFF';
			ctx.fillRect( posX - ( 25 * this.info.length ) / 2, posY - 45, 25 * this.info.length, 55 );
			ctx.textAlign = 'center';
			ctx.fillStyle = '#689191';
			ctx.fillText( this.info, posX, posY );
		}
	}
	setThumbnail( thumbnail: boolean ) {
		this.thumbnail = thumbnail;
	}

	sendSocket(): IGame {
		const newState: IGame = {
			posPaddle1: this.player1.getPaddle().y,
			sizePaddle1: this.player1.getPaddle().getSize(),
			posPaddle2: this.player2.getPaddle().y,
			sizePaddle2: this.player2.getPaddle().getSize(),
			posBall_x: this.ball.x,
			posBall_y: this.ball.y,

			sprite0Type: this.sprites[ 0 ] && this.sprites[ 0 ].isVisible() ? this.sprites[ 0 ].typeSprite : TypeSprite.NOTHING,
			sprite0x: this.sprites[ 0 ] ? this.sprites[ 0 ].x : 0,
			sprite0y: this.sprites[ 0 ] ? this.sprites[ 0 ].y : 0,

			sprite1Type: this.sprites[ 1 ] && this.sprites[ 1 ].isVisible() ? this.sprites[ 1 ].typeSprite : TypeSprite.NOTHING,
			sprite1x: this.sprites[ 1 ] ? this.sprites[ 1 ].x : 0,
			sprite1y: this.sprites[ 1 ] ? this.sprites[ 1 ].y : 0,

			sprite2Type: this.sprites[ 2 ] && this.sprites[ 2 ].isVisible() ? this.sprites[ 2 ].typeSprite : TypeSprite.NOTHING,
			sprite2x: this.sprites[ 2 ] ? this.sprites[ 2 ].x : 0,
			sprite2y: this.sprites[ 2 ] ? this.sprites[ 2 ].y : 0,

			sprite3Type: this.sprites[ 3 ] && this.sprites[ 3 ].isVisible() ? this.sprites[ 3 ].typeSprite : TypeSprite.NOTHING,
			sprite3x: this.sprites[ 3 ] ? this.sprites[ 3 ].x : 0,
			sprite3y: this.sprites[ 3 ] ? this.sprites[ 3 ].y : 0,
		};
		return newState;
	}

	/*********************************************************
							S O C K E T S
							R E C E I V E
	**********************************************************/

	receiveSocket( socket: IGame ) {
		this.sprites.length = 0;
		this.player1.getPaddle().y = socket.posPaddle1;
		this.player1.getPaddle().setSize( socket.sizePaddle1 );
		this.player2.getPaddle().y = socket.posPaddle2;
		this.player2.getPaddle().setSize( socket.sizePaddle2 );
		this.ball.x = socket.posBall_x;
		this.ball.y = socket.posBall_y;
		this.receiveSpriteSocket( socket );
	}

	receiveSpriteSocket( socket: IGame ) {
		if ( socket.sprite0Type !== TypeSprite.NOTHING ) {
			const num = this.addSprite( socket.sprite0Type );
			if ( num > 0 ) {
				this.sprites[ num - 1 ].x = socket.sprite0x;
				this.sprites[ num - 1 ].y = socket.sprite0y;
			}
		}
		if ( socket.sprite1Type !== TypeSprite.NOTHING ) {
			const num = this.addSprite( socket.sprite1Type );
			if ( num > 0 ) {
				this.sprites[ num - 1 ].x = socket.sprite1x;
				this.sprites[ num - 1 ].y = socket.sprite1y;
			}
		}
		if ( socket.sprite2Type !== TypeSprite.NOTHING ) {
			const num = this.addSprite( socket.sprite2Type );
			if ( num > 0 ) {
				this.sprites[ num - 1 ].x = socket.sprite2x;
				this.sprites[ num - 1 ].y = socket.sprite2y;
			}
		}
		if ( socket.sprite3Type !== TypeSprite.NOTHING ) {
			const num = this.addSprite( socket.sprite3Type );
			if ( num > 0 ) {
				this.sprites[ num - 1 ].x = socket.sprite3x;
				this.sprites[ num - 1 ].y = socket.sprite3y;
			}
		}
	}

	/***************************************************************
	 *                          S P R I T E S
	 ***************************************************************/
	addRandomSprite() {
		if ( Jeux.Bonus && this.isRunning() && this.sprites.length < 4 ) {
			//only 4 in same time
			const choice = Math.floor( Math.random() * Sprite.nbMaxSprite ) + 1;
			this.addSprite( choice );
		}
	}

	addSprite( type: number ): number {
		let num = 0;
		if ( this.sprites.length <= Sprite.nbMaxSprite ) {
			switch ( type ) {
				case TypeSprite.DOUBLEPADDLE:
					num = this.sprites.push( new DoublePaddle( this.width, this.height ) );
					break;
				case TypeSprite.HALFPADDLE:
					num = this.sprites.push( new HalfPaddle( this.width, this.height ) );
					break;
				case TypeSprite.FASTBALL:
					num = this.sprites.push( new FastBall( this.width, this.height, this.ball ) );
					break;
				case TypeSprite.INVERSEMOVE:
					num = this.sprites.push( new InverseMove( this.width, this.height ) );
					break;
				default:
					console.log( 'Sprite (' + type + ') not found.' );
			}
		}
		return num;
	}
}
export default Jeux;
