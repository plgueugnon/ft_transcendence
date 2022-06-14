import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EBlock } from './interfaces/block.entity';

@Injectable()
export class BlocksService {
	constructor(
		@InjectRepository( EBlock )
		private blocksRepository: Repository<EBlock>
	) { }

	//? GET DATA

	async getAll(): Promise<EBlock[]> {
		return this.blocksRepository.find();
	}

	/**
	 * getBlocked()
	 * @param login user's login
	 * Return a login tab of all users blocked by @param login
	 */
	async getBlocked( login: string ): Promise<string[]> {
		try {
			const blockedRaw: EBlock[] = await this.blocksRepository.find( { where: { sender: login, status: 'blocked' } } );

			if ( blockedRaw[ 0 ] )
				return blockedRaw.map( ( element: EBlock ) => element.receiver );
			else return [];
		} catch ( err ) {
			throw err;
		}
	}

	/**
	 * getBlockedBy()
	 * @param login user's login
	 * Return a login tab of the users that blocked @param login
	 */
	async getBlockedBy( login: string ): Promise<string[]> {
		try {
			const blockedRaw: EBlock[] = await this.blocksRepository.find( { where: { receiver: login } } );

			if ( blockedRaw[ 0 ] )
				return blockedRaw.map( ( element: EBlock ) => element.receiver );
			else return [];
		} catch ( err ) {
			throw err;
		}
	}

	//? POST DATA

	async block( from: string, to: string ) {
		try {
			const prevRelations: EBlock[] = await this.blocksRepository.find( { where: { sender: from, receiver: to } } );
			const prevRelation: EBlock = prevRelations[ 0 ];

			// If a relation is already set
			if ( prevRelation !== undefined && prevRelation.status === 'blocked' ) return;

			let relation: EBlock;
			// If a block entry already exists but is set to none
			if ( prevRelation ) {
				relation = { ...prevRelation };
				relation.status = 'blocked';
			} else {
				relation = {
					sender: from,
					receiver: to,
					status: 'blocked',
				};
			}

			await this.blocksRepository.save( relation );
		} catch ( err ) {
			throw err;
		}
	}

	async unblock( from: string, to: string ): Promise<boolean> {
		try {
			const prevRelations: EBlock[] = await this.blocksRepository.find( { where: { sender: from, receiver: to } } );
			const prevRelation: EBlock = prevRelations[ 0 ];

			/// If a relation is already set
			if ( prevRelation !== undefined && prevRelation.status === 'none' ) return;

			let relation: EBlock;

			// If a block entry already exists but is set to blocked
			if ( prevRelation ) {
				relation = { ...prevRelation };
				relation.status = 'none';
			} else {
				relation = {
					sender: from,
					receiver: to,
					status: 'none',
				};
			}

			await this.blocksRepository.save( relation );
		} catch ( err ) {
			throw err;
		}
	}
}
