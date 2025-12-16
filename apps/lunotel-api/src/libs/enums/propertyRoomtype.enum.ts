import { registerEnumType } from '@nestjs/graphql';

export enum RoomStatus {
	AVAILABLE = 'AVAILABLE',
	OCCUPIED = 'OCCUPIED',
	CLEANING = 'CLEANING',
	MAINTENANCE = 'MAINTENANCE',
	DRAFT = 'DRAFT',
}

registerEnumType(RoomStatus, {
	name: 'RoomStatus',
});
