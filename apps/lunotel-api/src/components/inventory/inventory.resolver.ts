import { Mutation, Resolver } from '@nestjs/graphql';
import { InventoryService } from './inventory.service';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class InventoryResolver {
	constructor(private readonly inventoryService: InventoryService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Boolean)
	public async createInventorysByAdmin(): Promise<boolean> {
		console.log('Mutation createInventoryAdmin');
		const result = await this.inventoryService.createInventorysByAdmin();
		return true;
	}
}
