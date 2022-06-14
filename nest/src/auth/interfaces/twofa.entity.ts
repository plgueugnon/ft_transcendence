import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity( 'twoFA' )
export class ETwoFA {
	@PrimaryColumn()
	login: string;

	@Column()
	code: string;

	@Column()
	expirationDate: string;
}
