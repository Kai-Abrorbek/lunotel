import { registerEnumType } from '@nestjs/graphql';

export enum ReservationStatus {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
	CHECKED_IN = 'CHECKED_IN',
	UPCOMING = 'UPCOMING',
}

registerEnumType(ReservationStatus, { name: 'ReservationStatus' });
