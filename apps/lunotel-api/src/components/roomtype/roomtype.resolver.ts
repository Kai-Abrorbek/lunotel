import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RoomtypeService } from './roomtype.service';
import { RoomType, RoomTypes } from '../../libs/dto/roomtype/roomtype';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoomsIquiry, RoomTypeInput } from '../../libs/dto/roomtype/roomtype.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { RoomTypeUpdate } from '../../libs/dto/roomtype/roomtype.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class RoomtypeResolver {
	constructor(private readonly roomTypeService: RoomtypeService) {}

	/*****************
	 **  	ANY   **
	 *****************/
	@UseGuards(WithoutGuard)
	@Query(() => RoomType)
	public async getRoom(@Args('roomId') roomId: string, @AuthMember('_id') memberId: ObjectId): Promise<RoomType> {
		console.log('Mutation updateRoomType');

		return await this.roomTypeService.getRoom(shapeIntoMongoObjectId(roomId), memberId);
	}
	/*****************
	 **  	AGENT   **
	 *****************/
	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => RoomType)
	public async createRoomType(
		@Args('input') input: RoomTypeInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<RoomType> {
		console.log('Mutation : createRoomType');

		return await this.roomTypeService.createRoomType(input, memberId);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => RoomType)
	public async updateRoomType(
		@Args('input') input: RoomTypeUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<RoomType> {
		console.log('Mutation updateRoomType');

		return await this.roomTypeService.updateRoomType(input, memberId);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => RoomTypes)
	public async getMyRooms(
		@Args('input') input: RoomsIquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<RoomTypes> {
		console.log('Mutation updateRoomType');

		return await this.roomTypeService.getMyRooms(input, memberId);
	}
}
