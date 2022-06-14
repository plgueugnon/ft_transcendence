import { Size, TypeSprite } from './constantes';

export interface IGame {
	posPaddle1: number;
	sizePaddle1: Size;
	posPaddle2: number;
	sizePaddle2: Size;
	posBall_x: number;
	posBall_y: number;

	sprite0x: number;
	sprite0y: number;
	sprite0Type: TypeSprite;

	sprite1x: number;
	sprite1y: number;
	sprite1Type: TypeSprite;

	sprite2x: number;
	sprite2y: number;
	sprite2Type: TypeSprite;

	sprite3x: number;
	sprite3y: number;
	sprite3Type: TypeSprite;
}
