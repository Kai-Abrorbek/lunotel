import { registerEnumType } from '@nestjs/graphql';

export enum RoomStatus {
	DRAFT = 'DRAFT',
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
}
registerEnumType(RoomStatus, {
	name: 'RoomStatus',
});
