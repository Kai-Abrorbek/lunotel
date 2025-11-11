import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Inventory } from '../../libs/dto/inventory/inventory';
import { InjectModel } from '@nestjs/mongoose';
import { StayPlan } from '../../libs/dto/stayplan/stayplan';
import { RoomType } from '../../libs/dto/roomtype/roomtype';
import { getNextMonthsDates } from '../../libs/utils/datetime.util';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { InventoryStatus } from '../../libs/enums/inventory.enum';

@Injectable()
export class InventoryService {
	constructor(@InjectModel('Inventory') private readonly inventoryModel: Model<Inventory>) {}

	public async createInventorys(roomType: RoomType, stayPlans: StayPlan[]): Promise<void> {
		const dates = getNextMonthsDates(1);
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
								inventoryAllotment: 5,
								inventoryStatus: InventoryStatus.OPEN,
							},
						},
						upsert: true,
					},
				})),
			);
		}
	}
}
