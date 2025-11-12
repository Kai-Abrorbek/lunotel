import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, Matches, Min } from 'class-validator';
import { InventoryStatus } from '../../enums/inventory.enum';
import { DATE_REGEX } from '../../utils/datetime.util';

@InputType()
export class InventoryInput {
	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	roomTypeId: string;

	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	stayPlanId: string;

	@Matches(DATE_REGEX, { message: 'inventoryDate must be in YYYY-MM-DD format' })
	@IsNotEmpty()
	@Field(() => String)
	inventoryDate: string;

	@IsInt()
	@Min(0)
	@Field(() => Int)
	inventoryAllotment: number;

	@IsNotEmpty()
	@IsInt()
	@Min(0)
	@Field(() => Int)
	inventoryPrice: number;

	@IsOptional()
	@IsEnum(InventoryStatus)
	@Field(() => InventoryStatus, { nullable: true })
	inventoryStatus?: InventoryStatus;
}
