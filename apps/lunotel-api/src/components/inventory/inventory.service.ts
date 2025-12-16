import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Inventory } from '../../libs/dto/inventory/inventory';
import { InjectModel } from '@nestjs/mongoose';
import { StayPlan } from '../../libs/dto/stayplan/stayplan';
import { RoomType } from '../../libs/dto/roomtype/roomtype';
import { getNextMonthsDates } from '../../libs/utils/datetime.util';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { InventoryStatus } from '../../libs/enums/inventory.enum';
import { InventoryUpdateInput } from '../../libs/dto/inventory/inventory.update';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class InventoryService {
	constructor(@InjectModel('Inventory') private readonly inventoryModel: Model<Inventory>) {}

	public async createInventorys(roomType: RoomType, stayPlans: StayPlan[]): Promise<void> {
		try {
			const dates = getNextMonthsDates(1); // parametr => 몇개월치
			const roomTypeId = shapeIntoMongoObjectId(roomType._id);
			for (const plan of stayPlans) {
				await this.inventoryModel.bulkWrite(
					dates.map((date) => ({
						updateOne: {
							filter: { roomTypeId, stayPlanId: plan._id, inventoryDate: date },
							update: {
								$setOnInsert: {
									roomTypeId,
									stayPlanId: plan._id,
									inventoryDate: date,
									inventoryAllotment: 1,
									inventoryStatus: InventoryStatus.OPEN,
									inventoryPrice: plan.stayPlanBasePrice,
								},
							},
							upsert: true,
						},
					})),
				);
			}
		} catch (err) {
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	public async updateInventory(input: InventoryUpdateInput): Promise<Inventory> {
		const _id = shapeIntoMongoObjectId(input._id);
		const roomTypeId = shapeIntoMongoObjectId(input.roomTypeId);
		const stayPlanId = shapeIntoMongoObjectId(input.stayPlanId);

		const targetInventory = await this.inventoryModel
			.findOneAndUpdate(
				{
					_id: _id,
					roomTypeId: roomTypeId,
					stayPlanId: stayPlanId,
				},
				input,
				{ new: true },
			)
			.exec();

		if (!targetInventory) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return targetInventory;
	}
}
