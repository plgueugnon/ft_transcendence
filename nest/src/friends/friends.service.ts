import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SAMPLE_FRIENDS } from 'src/constants';
import { IUsersPublic } from 'src/users/interfaces/usersPublic.interface';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

import { EFriend } from './interfaces/friend.entity';
import { IFriendInvite } from './interfaces/friendInvite.interface';

@Injectable()
export class FriendsService {
	constructor(
		@InjectRepository( EFriend )
		private friendsRepository: Repository<EFriend>,
		private usersService: UsersService
	) {
		//* Dev
		this.initDev().then( () => Logger.log( '[INFO] Dummy friends created' ) );
	}

	//? GET DATA

	async getAll(): Promise<EFriend[]> {
		return this.friendsRepository.find();
	}

	/**
	 * getByPair()
	 * @param p1 login of one of the two users
	 * @param p2 login of the other
	 * Fin and return an existing pair of users friend relation
	 */
	async getByPair( p1: string, p2: string ): Promise<EFriend | undefined> {
		const friendsRaw: EFriend[] = await this.friendsRepository.find( {
			where: [
				{ sender: p1, receiver: p2 },
				{ sender: p2, receiver: p1 },
			],
		} );

		if ( friendsRaw[ 0 ] )
			return friendsRaw[ 0 ];
		else
			return undefined;
	}

	async getFriendsLogin( userLogin: string ): Promise<string[]> {
		try {
			const friendsRaw: EFriend[] = await this.friendsRepository.find( {
				where: [
					{ sender: userLogin, status: 'accepted' },
					{ receiver: userLogin, status: 'accepted' },
				],
			} );
			// Only keep logins of the friend, not the user
			// ex: If I invited 'ted'. Then sender is 'me' and receiver is 'ted'. So we keep receiver.
			const friendsString: string[] = friendsRaw.map( ( element ) => {
				if ( element.sender === userLogin )
					return element.receiver;
				else
					return element.sender;
			} );
			// Remove duplicates (there shouldn't be)
			return [ ...new Set( friendsString ) ];
		} catch ( err ) {
			throw err;
		}
	}

	async getFriends( userLogin: string ): Promise<IUsersPublic[]> {
		try {
			const friendsLogin: string[] = await this.getFriendsLogin( userLogin );

			// const	friendsUsers: Promise< IUsersPublic >[] = friendsUniqueString.map(  // Error mgmt ?
			// 	async element => await this.usersService.findUserPublic( element )
			// );
			// return await Promise.all( friendsUsers );

			let friendsUser: IUsersPublic[] = []; // Error mgmt method but less opti
			for ( const login of friendsLogin ) {
				const user = await this.usersService.findUserPublic( login );
				if ( user )
					friendsUser.push( user );
			}

			return friendsUser;
		} catch ( err ) {
			throw err;
		}
	}

	async getSentInvites( login: string ): Promise<IFriendInvite[]> {
		try {
			const sentInvitesRaw: EFriend[] = await this.friendsRepository.find( { where: { sender: login, status: 'pending' } } );

			const sentInvites: IFriendInvite[] = sentInvitesRaw.map( ( element: EFriend ) => ( {
				sender: element.sender,
				receiver: element.receiver,
				status: element.status,
			} ) );

			return sentInvites;
		} catch ( err ) {
			throw err;
		}
	}

	async getPendingInvites( login: string ): Promise<IFriendInvite[]> {
		const pendingInvitesRaw: EFriend[] = await this.friendsRepository.find( { where: { receiver: login, status: 'pending' } } );

		const pendingInvites: IFriendInvite[] = pendingInvitesRaw.map( ( element: EFriend ) => ( {
			sender: element.sender,
			receiver: element.receiver,
			status: element.status,
		} ) );

		return pendingInvites;
	}

	//? POST DATA

	async invite( from: string, to: string ): Promise<boolean> {
		try {
			const prevRelation: EFriend = await this.getByPair( from, to );
			let relation: EFriend;

			// If relation is already pending
			if ( prevRelation !== undefined && prevRelation.status === 'pending' )
				return false;
			// If a relation entry already exists
			else if ( prevRelation ) {
				// Reset who is inviting.
				// ex: If A invited B for the first time in their relation, and then for some reason B is to invite A, it will not erase the relation but simply switch the two
				// Logger.log( "Non mais ho", relation );
				relation = prevRelation;
				relation.sender = from;
				relation.receiver = to;
				relation.status = 'pending';
			} else {
				relation = {
					sender: from,
					receiver: to,
					status: 'pending',
				};
			}

			await this.friendsRepository.save( relation );
			return true;
		} catch ( err ) {
			return false;
		}
	}

	async deny( from: string, to: string ): Promise<boolean> {
		try {
			let relation: EFriend = await this.getByPair( from, to );

			// If there is no friend relation
			if ( !relation )
				return false;
			relation.status = 'none';

			await this.friendsRepository.save( relation );
			return true;
		} catch ( err ) {
			return false;
		}
	}

	async accept( from: string, to: string ): Promise<boolean> {
		try {
			let relation: EFriend = await this.getByPair( from, to );

			// If there is no friend relation or sender tries to accept himself
			if ( !relation || relation.sender === from )
				return false;
			relation.status = 'accepted';
			console.table( relation );

			await this.friendsRepository.save( relation );
			return true;
		} catch ( err ) {
			return false;
		}
	}

	async initDev(): Promise<boolean> {
		try {
			const sampleUsers: EFriend[] = SAMPLE_FRIENDS;
			for ( const element of sampleUsers ) {
				await this.friendsRepository.save( element );
			}
			return true;
		} catch ( err ) {
			return false;
		}
	}

	//? DELETE DATA

	async removeAll(): Promise<boolean> {
		try {
			const allIds = ( await this.getAll() ).map( ( element ) => element.id );

			if ( allIds.length )
				this.friendsRepository.delete( allIds );
			return true;
		} catch ( err ) {
			throw err;
		}
	}
}
