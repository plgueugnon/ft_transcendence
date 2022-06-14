import { EMessages } from './../entities/messages.entity';
import { EditUserDto } from '../interfaces/editUser.dto';
import { EChannelUsers } from './../entities/channelUsers.entity';
import { ForbiddenException, Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EChannels } from '../entities/channels.entity';
import CreateChannelDto from '../interfaces/createChannel.dto';
import { EChannelRole } from '../entities/channelUsers.entity';
import { EditChannelDto } from '../interfaces/editChannel.dto';
import * as bcrypt from 'bcryptjs';

const saltNumber = 10;

@Injectable()
export class ChannelsService {
	MessagesRepository: any;
	constructor(
		@InjectRepository( EChannels )
		private channelsRepository: Repository<EChannels>,

		@InjectRepository( EChannelUsers )
		private channelUsersRepository: Repository<EChannelUsers>,

		@InjectRepository( EMessages )
		private messagesRepository: Repository<EMessages>
	) { }

	//? GET DATA
	async findAllChannels(): Promise<EChannels[] | undefined> {
		try {
			return await this.channelsRepository.find();
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	// return the password of the channel if it is protected or null if it is not
	// async findIsChannelProtected( channelId: number ): Promise<string | null> {
	// 	const password = await this.channelsRepository.findOne( channelId, { select: [ 'password' ] } );

	// 	if ( password )
	// 		return password.password;
	// 	else
	// 		return null;
	// }

	// find all the channels where the userLogin is the same as login argument
	async findPrivateChannelsByLogin( login: string ): Promise<EChannels[]> {
		try {
			// Get all tables where the userLogin is the same as login argument in ChannelUsers
			const channelUsers = await this.channelUsersRepository.find( { userLogin: login } );
			// Extract the channelId from the ChannelUsers table
			const channelsIds: number[] = [];
			for ( let i = 0; i < channelUsers.length; i++ )
				channelsIds.push( channelUsers[ i ].channelId );
			if ( channelsIds.length === 0 )
				return [];
			// Get all the channels where the user is
			const channelList = await this.channelsRepository
				.createQueryBuilder( 'channels' )
				.where( 'channels.channelId IN (:...channelsIds)', { channelsIds: channelsIds } )
				.andWhere( 'channels.isPrivate = :isPrivate', { isPrivate: true } )
				.getMany();
			return channelList;
		} catch ( e ) {
			return [];
			// throw new NotFoundException( e );
		}
	}

	// find all the channels where isPrivate = false and  when user is member
	async findJoinedPublicChannelsByLogin( login: string ): Promise<EChannels[]> {
		try {
			// Get all tables where the userLogin is the same as login argument in ChannelUsers
			const channelUsers = await this.channelUsersRepository.createQueryBuilder( 'channelUsers' )
				.where( 'channelUsers.userLogin = :userLogin', { userLogin: login } )
				.getMany();
			// Extract the channelId from the ChannelUsers table
			const channelsIds: number[] = [];
			for ( let i = 0; i < channelUsers.length; i++ )
				channelsIds.push( channelUsers[ i ].channelId );
			if ( channelsIds.length === 0 )
				return [];
			// Get all the channels where the user is
			const channelList = await this.channelsRepository
				.createQueryBuilder( 'channels' )
				// .where( "channels.channelId IN (:...channelsIds)", { channelsIds: channelsIds } )
				.where( 'channels.isPrivate = :isPrivate', { isPrivate: false } )
				.andWhere( 'channels.channelId IN (:...channelsIds)', { channelsIds: channelsIds } )
				.getMany();
			return channelList;
		} catch ( e ) {
			return [];
		}
	}
	async findUnjoinedPublicChannelsByLogin( login: string ): Promise<EChannels[]> {
		try {
			const JoinedChannels = await this.findJoinedPublicChannelsByLogin( login );
			const allChannels = await this.findAllChannels();
			let unjoinedChannels = allChannels.filter( channel =>
				!JoinedChannels.some( joinedChannel => joinedChannel.channelId === channel.channelId )
			);
			// ! fix issue with filtering unjoined public channels
			unjoinedChannels = unjoinedChannels.filter( channel => channel.isPrivate === false )
			return unjoinedChannels;
		}
		catch ( e ) {
			return [];
		}
	}

	async findUserRoleByChannelId( channelId: number, login: string ): Promise<string> {
		try {
			const userRole = await this.channelUsersRepository
				.createQueryBuilder( 'channelUsers' )
				.where( 'channelUsers.channelId = :channelId', { channelId: channelId } )
				.andWhere( 'channelUsers.userLogin = :userLogin', { userLogin: login } )
				.getOne();
			return userRole.role;
		} catch ( e ) {
			throw new NotFoundException( e );
		}
	}
	async findUsersByChannelId( channelId: number ): Promise<EChannelUsers[]> {
		try {
			// Get all tables where the channelId is the same as channelId argument in ChannelUsers
			const channelUsers = await this.channelUsersRepository.createQueryBuilder( 'channelUsers' )
				.where( 'channelUsers.channelId = :channelId', { channelId: channelId } )
				.getMany();
			if ( channelUsers.length === 0 )
				throw new NotFoundException( 'No users in this channel' );
			return channelUsers;
		} catch ( e ) {
			return [];
		}
	}

	//? POST DATA
	// ! CREATE
	async createChannel( createChannelDto: CreateChannelDto ): Promise<EChannels> {
		try {
			// * Create channel, fill the settings and save it
			const newChannel = new EChannels();
			newChannel.channelIdFront = createChannelDto.channelIdFront;
			newChannel.channelName = createChannelDto.channelName;
			newChannel.isPrivate = createChannelDto.isPrivate;
			if ( createChannelDto.password === '' )
				newChannel.password = null;
			else
				newChannel.password = await bcrypt.hash( createChannelDto.password, saltNumber );

			// * Save the channel to get the autogenerated Channel
			const channel = await this.channelsRepository.save( newChannel );

			//*  add the owner to the channel users
			const newOwner = new EChannelUsers();
			newOwner.channelId = channel.channelId;
			newOwner.role = EChannelRole.OWNER;
			newOwner.userLogin = createChannelDto.owner;
			newOwner.bannedUntil = null;
			newOwner.mutedUntil = null;
			await this.channelUsersRepository.save( newOwner );

			//*  add other members to the channel users
			for ( let i = 0; i < createChannelDto.users.length; i++ ) {
				const newMember = new EChannelUsers();
				newMember.channelId = channel.channelId;
				newMember.role = EChannelRole.MEMBER;
				newMember.userLogin = createChannelDto.users[ i ];
				newMember.bannedUntil = null;
				newMember.mutedUntil = null;
				await this.channelUsersRepository.save( newMember );
			}

			return await this.channelsRepository.save( newChannel );
		} catch ( e ) {
			throw new NotFoundException( e );
		}
	}

	// ! EDIT
	async muteUserInChannel( muteUser: EditUserDto ) {
		try {
			const id = muteUser.channelId;
			const userLogin = muteUser.userLogin;
			const timeStamp = muteUser.timeStamp;
			const user = await this.channelUsersRepository
				.createQueryBuilder( "channelUsers" )
				.where( "channelUsers.channelId = :id", { id: id } )
				.andWhere( "channelUsers.userLogin = :userLogin", {
					userLogin: userLogin,
				} )
				.getOne();
			return this.channelUsersRepository.update( user, {
				mutedUntil: timeStamp,
			} );
		} catch ( e ) {
			throw new NotFoundException( e );
		}
	}

	async banUserInChannel( banUser: EditUserDto ) {
		try {
			const id = banUser.channelId;
			const userLogin = banUser.userLogin;
			const timeStamp = banUser.timeStamp;
			const user = await this.channelUsersRepository
				.createQueryBuilder( 'channelUsers' )
				.where( 'channelUsers.channelId = :id', { id: id } )
				.andWhere( 'channelUsers.userLogin = :userLogin', { userLogin: userLogin } )
				.getOne();
			return this.channelUsersRepository.update( user, { bannedUntil: timeStamp } );
		}
		catch ( e ) {
			throw new NotFoundException( e );
		}
	}

	async kickUserFromChannel( kickUser: EditUserDto ) {
		try {
			const id = kickUser.channelId;
			const userLogin = kickUser.userLogin;
			const user = await this.channelUsersRepository
				.createQueryBuilder( "channelUsers" )
				.where( "channelUsers.channelId = :id", { id: id } )
				.andWhere( "channelUsers.userLogin = :userLogin", {
					userLogin: userLogin,
				} )
				.getOne();
			return this.channelUsersRepository.delete( user );
		} catch ( e ) {
			throw new NotFoundException( e );
		}
	}

	async editChannelUserRole( editUser: EditUserDto ) {
		try {
			const id = editUser.channelId;
			const userLogin = editUser.userLogin;
			const role = editUser.newRole;
			const user = await this.channelUsersRepository
				.createQueryBuilder( 'channelUsers' )
				.where( 'channelUsers.channelId = :id', { id: id } )
				.andWhere( 'channelUsers.userLogin = :userLogin', { userLogin: userLogin } )
				.getOne();
			return this.channelUsersRepository.update( user, { role: role } );
		}
		catch ( e ) {
			throw new NotFoundException( e );
		}
	}

	async joinPublicChannel( joinChannel: EditChannelDto ) {
		try {
			const password = await this.channelsRepository.findOne(
				joinChannel.channelId,
				{ select: [ "password" ] },
			);
			if (
				password === undefined ||
				( await bcrypt.compare( joinChannel.password, password.password ) )
			) {
				const newMember = new EChannelUsers();
				newMember.channelId = joinChannel.channelId;
				newMember.role = EChannelRole.MEMBER;
				newMember.userLogin = joinChannel.querier;
				newMember.bannedUntil = null;
				newMember.mutedUntil = null;
				return this.channelUsersRepository.save( newMember );
			}
			throw new ForbiddenException( "Wrong password" );
		} catch ( e ) {
			throw new UnauthorizedException( 'Wrong password' );
		}
	}

	async editChannelName( editChannel: EditChannelDto ) {
		try {
			const id = editChannel.channelId;
			const channelName = editChannel.channelName;
			const channel = await this.channelsRepository.createQueryBuilder( 'channels' )
				.where( 'channels.channelId = :id', { id: id } )
				.getOne();
			return this.channelsRepository.update( channel, { channelName: channelName } );
		}
		catch ( e ) {
			throw new NotFoundException( e );
		}
	}

	async editChannelPassword( editChannel: EditChannelDto ) {
		try {
			const id = editChannel.channelId;
			let password: string;
			if ( editChannel.password === '' )
				password = null;
			else
				password = await bcrypt.hash( editChannel.password, saltNumber );
			const channel = await this.channelsRepository.createQueryBuilder( 'channels' )
				.where( 'channels.channelId = :id', { id: id } )
				.getOne();
			return this.channelsRepository.update( channel, { password: password } );
		}
		catch ( e ) {
			throw new NotFoundException( e );
		}
	}

	//? DELETE DATA
	// ! DELETE

	async deleteChannel( editChannel: EditChannelDto ) {
		try {
			const id = editChannel.channelId;
			const channel = await this.channelsRepository.createQueryBuilder( 'channels' )
				.where( 'channels.channelId = :id', { id: id } )
				.getOne();

			const channelUsers = await this.channelUsersRepository.createQueryBuilder( 'channelUsers' )
				.where( 'channelUsers.channelId = :id', { id: id } )
				.getMany();
			for ( let i = 0; i < channelUsers.length; i++ ) {
				this.channelUsersRepository.delete( channelUsers[ i ] );
			}
			const channelMessages = await this.messagesRepository.createQueryBuilder( 'channelMessages' )
				.where( 'channelMessages.channelId = :id', { id: id } )
				.getMany();
			for ( let i = 0; i < channelMessages.length; i++ ) {
				this.messagesRepository.delete( channelMessages[ i ] );
			}
			return this.channelsRepository.delete( channel );
		}
		catch ( e ) {
			throw new NotFoundException( e );
		}
	}

	async leaveChannel( editChannel: EditUserDto ) {
		try {
			const id = editChannel.channelId;
			const channelUser = await this.channelUsersRepository
				.createQueryBuilder( 'channels' )
				.where( 'channels.channelId = :id', { id: id } )
				.andWhere( 'channels.userLogin = :userLogin', { userLogin: editChannel.userLogin } )
				.getOne();
			return this.channelUsersRepository.delete( channelUser );
		}
		catch ( e ) {
			throw new NotFoundException( e );
		}
	}
}

// async removeAll(): Promise< boolean > {
// 	try {
// 		const	allIds = ( await this.findAll() ).map( element => element.id );

// 		this.usersRepository.delete( allIds );
// 	} catch ( err ) {
// 		Logger.log( "error: Users db wipe failed" );
// 		return false;
// 	}
// }

// async removeByLogin( login: string ): Promise< string > {
// try {
// 	await this.usersRepository.delete( id );
// } catch ( err ) {
// 	return "error: Unable to erase user#" + id + ".";
// } finally {
// 	return "user#" + id + " erased.";
// }
// }
