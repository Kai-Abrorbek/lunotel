import { registerEnumType } from '@nestjs/graphql';

export enum ReservationStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	CANCELLED = 'CANCELLED',
}

registerEnumType(ReservationStatus, { name: 'ReservationStatus' });
