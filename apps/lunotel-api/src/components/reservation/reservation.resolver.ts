import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ReservationService } from './reservation.service';
import { Reservation } from '../../libs/dto/reservation/reservation';
import { UseGuards } from '@nestjs/common';
import { WithoutGuard } from '../auth/guards/without.guard';
import { ReservationInput } from '../../libs/dto/reservation/reservation.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';

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
}
