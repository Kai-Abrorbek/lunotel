import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, Matches, Min } from 'class-validator';
import { InventoryStatus } from '../../enums/inventory.enum';
import { DATE_REGEX } from '../../utils/datetime.util';

@InputType()
export class InventoryUpdateInput {
	@IsMongoId()
	@IsNotEmpty()
	@Field(() => String)
	_id: string;

	@IsOptional()
	@IsMongoId()
	@Field(() => String, { nullable: true })
	roomTypeId?: string;

	@IsOptional()
	@IsMongoId()
	@Field(() => String, { nullable: true })
	stayPlanId?: string;

	@IsOptional()
	@Matches(DATE_REGEX, { message: 'inventoryDate must be in YYYY-MM-DD format' })
	@Field(() => String, { nullable: true })
	inventoryDate?: string;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	inventoryAllotment?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	inventoryPrice?: number;

	@IsOptional()
	@IsEnum(InventoryStatus)
	@Field(() => InventoryStatus, { nullable: true })
	inventoryStatus?: InventoryStatus;
}
