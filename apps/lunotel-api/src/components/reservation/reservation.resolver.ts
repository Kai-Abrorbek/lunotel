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
} from '../../libs/dto/reservation/reservation.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { ReservationUpdateInput } from '../../libs/dto/reservation/reservation.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthGuard } from '../auth/guards/auth.guard';

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
		return await this.reservationService.getMyReservation(input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Reservations)
	public async getMyReservations(
		@Args('input') input: ReservationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Reservations> {
		return await this.reservationService.getMyReservations(input, memberId);
	}
}
