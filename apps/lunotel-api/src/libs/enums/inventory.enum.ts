import { registerEnumType } from '@nestjs/graphql';

export enum InventoryStatus {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
}
registerEnumType(InventoryStatus, { name: 'InventoryStatus' });
