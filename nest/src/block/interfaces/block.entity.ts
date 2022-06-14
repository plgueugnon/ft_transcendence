import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity( 'blocks' )
export class EBlock {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column()
	sender: string;

	@Column()
	receiver: string;

	@Column()
	status: 'none' | 'blocked';
}
