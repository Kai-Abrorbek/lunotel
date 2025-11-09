import { registerEnumType } from '@nestjs/graphql';

export enum StayPlanType {
	DAY_USE = 'DAY_USE',
	OVERNIGHT = 'OVERNIGHT',
}
registerEnumType(StayPlanType, { name: 'StayPlanType' });

export enum StayPlanStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
}
registerEnumType(StayPlanStatus, { name: 'StayPlanStatus' });
