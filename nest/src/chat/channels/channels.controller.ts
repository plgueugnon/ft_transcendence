import { CHANNELNAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, TIMESTAMP_MAX_LENGTH, USERNAME_MAX_LENGTH } from 'src/constants';
import { AuthGuard } from '@nestjs/passport';
import { EditUserDto } from '../interfaces/editUser.dto';
import { EChannelUsers } from './../entities/channelUsers.entity';
import { EChannels } from './../entities/channels.entity';
import { CreateChannelDto } from '../interfaces/createChannel.dto';
import { Controller, Get, Post, UseGuards, BadRequestException, Param, Body, ForbiddenException } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { EditChannelDto } from '../interfaces/editChannel.dto';
import { UsersService } from 'src/users/users.service';
import { IUserProfile } from 'src/auth/interfaces/userProfile.interface';

@Controller( 'chat' )
export class ChannelsController {
	constructor( private ChannelsService: ChannelsService, private usersService: UsersService ) { }

	// ? GET DATA
	@Get( '/channels' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findAllChannels(): Promise<EChannels[] | undefined> {
		try {
			let channel: EChannels[] = await this.ChannelsService.findAllChannels();
			if ( !channel )
				channel = [];
			// throw new BadRequestException( "no Channel" );
			return channel;
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	// * Return  the password of the channel or null if the channel is not protected
	// @Get("/channels/protected/:channelId")
	// async findIsChannelProtected(
	// 	@Param("channelId") channelId: number,
	// ): Promise<string | null> {
	// 	return this.ChannelsService.findIsChannelProtected(channelId);
	// }

	// * Return all channels in which user is member
	@Get( '/channels/private/:login' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findPrivateChannelsByLogin( @Param( 'login' ) login: string ): Promise<EChannels[]> {
		try {
			if ( !login || login.length > USERNAME_MAX_LENGTH )
				throw new BadRequestException( 'Missing login or to long login' );
			const userProfile: IUserProfile | undefined = await this.usersService.findUserProfile( login );
			if ( !userProfile )
				throw new BadRequestException( 'User not found' );
			return this.ChannelsService.findPrivateChannelsByLogin( login );
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	// * Return all channels in which user is member
	@Get( '/channels/public/joined/:login' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findJoinedPublicChannelsByLogin( @Param( 'login' ) login: string ): Promise<EChannels[]> {
		try {
			if ( !login || login.length > USERNAME_MAX_LENGTH )
				throw new BadRequestException( 'Missing login or to long login' );
			const userProfile: IUserProfile | undefined = await this.usersService.findUserProfile( login );
			if ( !userProfile )
				throw new BadRequestException( 'User not found' );
			return this.ChannelsService.findJoinedPublicChannelsByLogin( login );
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}
	// * Return all channels in which user is member
	@Get( '/channels/public/unjoined/:login' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findUnjoinedPublicChannelsByLogin( @Param( 'login' ) login: string ): Promise<EChannels[]> {
		try {
			if ( !login || login.length > USERNAME_MAX_LENGTH )
				throw new BadRequestException( 'Missing login or to long login' );
			const userProfile: IUserProfile | undefined = await this.usersService.findUserProfile( login );
			if ( !userProfile )
				throw new BadRequestException( 'User not found' );
			return this.ChannelsService.findUnjoinedPublicChannelsByLogin( login );
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	// * Return all the users with roles in a channel
	@Get( '/channels/users/:channelId' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async findUsersByChannelId( @Param( 'channelId' ) channelId: number ): Promise<EChannelUsers[]> {
		try {
			if ( !channelId )
				throw new BadRequestException( 'Missing channelId' );
			return this.ChannelsService.findUsersByChannelId( channelId );
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	// ? POST DATA
	// ! CREATE
	// * Create a new channel
	@Post( '/channels' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async createChannel( @Body() channel: CreateChannelDto ) {
		try {
			if ( !channel || channel.channelName.length > CHANNELNAME_MAX_LENGTH || channel.password.length > PASSWORD_MAX_LENGTH || channel.owner.length > USERNAME_MAX_LENGTH )
				throw new BadRequestException( 'Missing channel or to long channel name or to long password or to long owner' );
			else return this.ChannelsService.createChannel( channel );
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	// ! UPDATE
	// * Mute a user in a channel -> Update ChannelUsers table
	@Post( '/channels/mute/user' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async muteUserInChannel( @Body() muteUser: EditUserDto ) {
		try {
			if ( !muteUser || muteUser.querier.length > USERNAME_MAX_LENGTH || muteUser.userLogin.length > USERNAME_MAX_LENGTH || muteUser.timeStamp.length > TIMESTAMP_MAX_LENGTH )
				throw new BadRequestException( 'Missing muteUser or to long querier or to long userLogin or to long timeStamp' );
			const querierRole = await this.ChannelsService.findUserRoleByChannelId( muteUser.channelId, muteUser.querier );
			const targetRole = await this.ChannelsService.findUserRoleByChannelId( muteUser.channelId, muteUser.userLogin );
			if ( ( querierRole === 'Owner' && targetRole !== 'Owner' ) || ( querierRole === 'Admin' && targetRole === 'Member' ) ) {
				return this.ChannelsService.muteUserInChannel( muteUser );
			} else throw new ForbiddenException( "Forbidden ! You don't have the right to do this ! Mute failed." );
		} catch ( e ) {
			throw new ForbiddenException( e );
		}
	}

	// * Ban a user in a channel -> Update ChannelUsers table
	@Post( '/channels/ban/user' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async banUserInChannel( @Body() banUser: EditUserDto ) {
		try {
			if ( !banUser || banUser.querier.length > USERNAME_MAX_LENGTH || banUser.userLogin.length > USERNAME_MAX_LENGTH || banUser.timeStamp.length > TIMESTAMP_MAX_LENGTH )
				throw new BadRequestException( 'Missing banUser or to long querier or to long userLogin or to long timeStamp' );
			const querierRole = await this.ChannelsService.findUserRoleByChannelId( banUser.channelId, banUser.querier );
			const targetRole = await this.ChannelsService.findUserRoleByChannelId( banUser.channelId, banUser.userLogin );
			if ( ( querierRole === 'Owner' && targetRole !== 'Owner' ) || ( querierRole === 'Admin' && targetRole === 'Member' ) ) {
				return this.ChannelsService.banUserInChannel( banUser );
			} else throw new ForbiddenException( "Forbidden ! You don't have the right to do this ! Ban failed." );
		} catch ( e ) {
			throw new ForbiddenException( e );
		}
	}

	// * Kick a user in a channel -> Delete ChannelUsers table
	@Post( '/channels/kick/user' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async kickUserFromChannel( @Body() kickUser: EditUserDto ) {
		try {
			if ( !kickUser || kickUser.querier.length > USERNAME_MAX_LENGTH || kickUser.userLogin.length > USERNAME_MAX_LENGTH || kickUser.timeStamp.length > TIMESTAMP_MAX_LENGTH )
				throw new BadRequestException( 'Missing kickUser or to long querier or to long userLogin or to long timeStamp' );
			const querierRole = await this.ChannelsService.findUserRoleByChannelId( kickUser.channelId, kickUser.querier );
			const targetRole = await this.ChannelsService.findUserRoleByChannelId( kickUser.channelId, kickUser.userLogin );
			if ( ( querierRole === 'Owner' && targetRole !== 'Owner' ) || ( querierRole === 'Admin' && targetRole === 'Member' ) ) {
				return this.ChannelsService.kickUserFromChannel( kickUser );
			} else throw new ForbiddenException( "Forbidden ! You don't have the right to do this ! Kick failed." );
		} catch ( e ) {
			throw new ForbiddenException( e );
		}
	}

	// * Edit channelName
	@Post( '/channels/name' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async editChannelName( @Body() channelName: EditChannelDto ) {
		try {
			if ( !channelName || channelName.channelName.length > CHANNELNAME_MAX_LENGTH || channelName.querier.length > USERNAME_MAX_LENGTH || channelName.password.length > PASSWORD_MAX_LENGTH )
				throw new BadRequestException( 'Missing channelName or to short channelName or to short querier or to short password' );
			const querierRole = await this.ChannelsService.findUserRoleByChannelId( channelName.channelId, channelName.querier );
			if ( querierRole === 'Owner' ) {
				return this.ChannelsService.editChannelName( channelName );
			} else throw new ForbiddenException( "Forbidden ! You don't have the right to do this ! ChannelName change failed." );
		} catch ( e ) {
			throw new ForbiddenException( e );
		}
	}

	// * Edit channelPassword
	@Post( '/channels/password' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async editChannelPassword( @Body() channelPassword: EditChannelDto ) {
		try {
			if (
				!channelPassword ||
				channelPassword.channelName.length > CHANNELNAME_MAX_LENGTH ||
				channelPassword.querier.length > USERNAME_MAX_LENGTH ||
				channelPassword.password.length > PASSWORD_MAX_LENGTH
			)
				throw new BadRequestException( 'Missing channelPassword or to short channelName or to short querier or to short password' );
			const querierRole = await this.ChannelsService.findUserRoleByChannelId( channelPassword.channelId, channelPassword.querier );
			if ( querierRole === 'Owner' ) {
				return this.ChannelsService.editChannelPassword( channelPassword );
			} else throw new ForbiddenException( "Forbidden ! You don't have the right to do this ! ChannelPassword change failed." );
		} catch ( e ) {
			throw new ForbiddenException( e );
		}
	}

	// * Edit ChannelUser Role
	@Post( '/channels/user/role' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async editChannelUserRole( @Body() editUserRole: EditUserDto ) {
		try {
			if ( !editUserRole || editUserRole.querier.length > USERNAME_MAX_LENGTH || editUserRole.userLogin.length > USERNAME_MAX_LENGTH || editUserRole.timeStamp.length > TIMESTAMP_MAX_LENGTH )
				throw new BadRequestException( 'Missing editUserRole or to short querier or to short userLogin or to short timeStamp' );
			const querierRole = await this.ChannelsService.findUserRoleByChannelId( editUserRole.channelId, editUserRole.querier );
			const targetRole = await this.ChannelsService.findUserRoleByChannelId( editUserRole.channelId, editUserRole.userLogin );
			if ( editUserRole.newRole === 'Owner' && querierRole === 'Owner' && targetRole !== 'Owner' )
				return this.ChannelsService.editChannelUserRole( editUserRole );
			if ( editUserRole.newRole === 'Admin' && querierRole === 'Owner' && targetRole !== 'Owner' && targetRole !== 'Admin' )
				return this.ChannelsService.editChannelUserRole( editUserRole );
			if ( editUserRole.newRole === 'Member' && querierRole === 'Owner' && targetRole !== 'Owner' && targetRole !== 'Member' )
				return this.ChannelsService.editChannelUserRole( editUserRole );
			else throw new ForbiddenException( "Forbidden ! You don't have the right to do this ! UserRole change failed." );
		} catch ( e ) {
			throw new ForbiddenException( e );
		}
	}

	@Post( '/channels/join' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async joinPublicChannel( @Body() joinChannel: EditChannelDto ) {
		try {
			if ( !joinChannel || joinChannel.channelName.length > CHANNELNAME_MAX_LENGTH || joinChannel.querier.length > USERNAME_MAX_LENGTH || joinChannel.password.length > PASSWORD_MAX_LENGTH )
				throw new BadRequestException( 'Missing joinChannel or to short channelName or to short querier or to short password' );
			return this.ChannelsService.joinPublicChannel( joinChannel );
		} catch ( e ) {
			throw new BadRequestException( e );
		}
	}

	// ! DELETE
	// * delete channel
	@Post( '/channels/delete' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async deleteChannel( @Body() deleteChannel: EditChannelDto ) {
		try {
			if (
				!deleteChannel ||
				deleteChannel.channelName.length > CHANNELNAME_MAX_LENGTH ||
				deleteChannel.querier.length > USERNAME_MAX_LENGTH ||
				deleteChannel.password.length > PASSWORD_MAX_LENGTH
			)
				throw new BadRequestException( 'Missing deleteChannel or to short channelName or to short querier or to short password' );
			const querierRole = await this.ChannelsService.findUserRoleByChannelId( deleteChannel.channelId, deleteChannel.querier );
			if ( querierRole === 'Owner' ) {
				return this.ChannelsService.deleteChannel( deleteChannel );
			} else throw new ForbiddenException( "Forbidden ! You don't have the right to do this ! Delete channel failed." );
		} catch ( e ) {
			throw new ForbiddenException( e );
		}
	}

	// * Leave channel
	@Post( '/channels/leave' )
	@UseGuards( AuthGuard( 'jwt' ) )
	async leaveChannel( @Body() leaveChannel: EditUserDto ) {
		try {
			if ( !leaveChannel || leaveChannel.querier.length > USERNAME_MAX_LENGTH || leaveChannel.userLogin.length > USERNAME_MAX_LENGTH || leaveChannel.timeStamp.length > TIMESTAMP_MAX_LENGTH )
				throw new BadRequestException( 'Missing editUserRole or to short querier or to short userLogin or to short timeStamp' );
			if ( leaveChannel.channelId === undefined ) {
				throw new BadRequestException( 'ChannelId is required' );
			}
			return this.ChannelsService.leaveChannel( leaveChannel );
		} catch ( e ) {
			throw new ForbiddenException( e );
		}
	}
}
