import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReservationService } from './reservation.service';
import { Reservation, Reservations } from '../../libs/dto/reservation/reservation';
import { UseGuards } from '@nestjs/common';
import { WithoutGuard } from '../auth/guards/without.guard';
import {
	memberInfoInput,
	NoAuthMemberInfoInput,
	ReservationInput,
	ReservationsInquiry,
	RoomReservationsInquiry,
} from '../../libs/dto/reservation/reservation.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { ReservationUpdateInput } from '../../libs/dto/reservation/reservation.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class ReservationResolver {
	constructor(private readonly reservationService: ReservationService) {}

	@UseGuards(WithoutGuard)
	@Mutation(() => Reservation)
	public async createReservation(
		@Args('input') input: ReservationInput,
		@AuthMember() memberId: ObjectId,
	): Promise<Reservation> {
		console.log(memberId);
		return await this.reservationService.createReservation(input, memberId);
	}

	@UseGuards(WithoutGuard)
	@Mutation(() => Reservation)
	public async updateReservation(
		@Args('input') input: ReservationUpdateInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Reservation> {
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.reservationService.updateReservation(input, memberId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Reservation)
	public async getMyReservation(
		@Args('input') input: NoAuthMemberInfoInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Reservation> {
		return await this.reservationService.getMyReservation(input, memberId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Reservations)
	public async getMyReservations(
		@Args('input') input: ReservationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Reservations> {
		return await this.reservationService.getMyReservations(input, memberId);
	}

	/*****************
	 **  	AGENT   **
	 *****************/
	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => Reservations)
	public async getAgentReservations(
		@Args('input') input: ReservationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Reservations> {
		console.log('Query: getAgentReservations');
		return await this.reservationService.getAgentReservations(input, memberId);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => Reservations)
	public async getRoomReservations(
		@Args('input') input: RoomReservationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Reservations> {
		console.log('Query: getRoomReservations');
		return await this.reservationService.getRoomReservations(input, memberId);
	}
}
