import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { InventoryStatus } from '../../enums/inventory.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Inventory {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	roomTypeId: ObjectId;

	@Field(() => String)
	stayPlanId: ObjectId;

	@Field(() => String)
	inventoryDate: string;

	@Field(() => Int)
	inventoryAllotment: number;

	@Field(() => Int, { nullable: true })
	inventoryPrice?: number;

	@Field(() => InventoryStatus)
	inventoryStatus: InventoryStatus;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class Inventories {
	@Field(() => [Inventory])
	list: Inventory[];

	@Field(() => [TotalCounter])
	metaCounter: TotalCounter[];
}
