import { registerEnumType } from '@nestjs/graphql';

export enum ReservationStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	CANCELLED = 'CANCELLED',
	CHECKED_IN = 'CHECKED_IN',
}

registerEnumType(ReservationStatus, { name: 'ReservationStatus' });
