import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import {
	AgentPropertiesInquiry,
	AllPropertiesInquiry,
	PropertiesInquiry,
	PropertyInput,
	PropertyInquiry,
} from '../../libs/dto/property/property.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import {
	lookupAuthMemberLiked,
	lookupInventory,
	lookupMember,
	lookupRooms,
	shapeIntoMongoObjectId,
} from '../../libs/config';
import { RoomType } from '../../libs/dto/roomtype/roomtype';
import { StayPlan } from '../../libs/dto/stayplan/stayplan';
import { Inventory } from '../../libs/dto/inventory/inventory';
import { Member } from '../../libs/dto/member/member';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('RoomType') private readonly roomTypeModel: Model<RoomType>,
		@InjectModel('StayPlan') private readonly stayPlanModel: Model<StayPlan>,
		@InjectModel('Inventory') private readonly inventoryModel: Model<Inventory>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly memberService: MemberService,
	) {}

	public async createProperty(input: PropertyInput): Promise<Property> {
		try {
			const result = await this.propertyModel.create(input);

			if (result) {
				const member = await this.memberService.memberStatsEditor({
					_id: result.memberId,
					modifier: 1,
					targetKey: 'memberProperties',
				});
			}

			return result;
		} catch (err) {
			console.log('ERROR, createProperty: ', err.message);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	public async getProperty(memberId: ObjectId, input: PropertyInquiry): Promise<Property> {
		const propertyId = shapeIntoMongoObjectId(input._id);

		const startDate = input.checkInDate;
		const endDate = input.checkOutDate;
		const dateFilter = startDate && endDate ? { inventoryDate: { $gte: startDate, $lt: endDate } } : {};

		const property = await this.propertyModel
			.findOne({
				_id: propertyId,
				propertyName: input.propertyName,
				propertyStatus: { $in: [PropertyStatus.DRAFT, PropertyStatus.ACTIVE] },
			})
			.lean();

		if (!property) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		const memberData = await this.memberModel.findById(property.memberId).lean();
		const rooms = await this.roomTypeModel
			.find({ propertyId: propertyId, roomMaxPersonal: { $gte: input.personal } })
			.lean();
		const stayPlans = await this.stayPlanModel
			.find({
				roomTypeId: { $in: rooms.map((room) => room._id) },
			})
			.lean();

		const inventories = await this.inventoryModel
			.find({
				roomTypeId: { $in: rooms.map((r) => r._id) },
				stayPlanId: { $in: stayPlans.map((plan) => plan._id) },
				...dateFilter,
			})
			.lean();

		const roomsWithPlans = rooms.map((room) => {
			const plansForRoom = stayPlans
				.filter((plan) => plan.roomTypeId.toString() === room._id.toString())
				.map((plan) => {
					const invForPlan = inventories.filter((inv) => inv.stayPlanId.toString() === plan._id.toString());

					return {
						_id: plan._id,
						roomTypeId: plan.roomTypeId,
						stayPlanType: plan.stayPlanType,
						stayPlanName: plan.stayPlanName,
						stayPlanBasePrice: plan.stayPlanBasePrice,
						stayPlanRules: plan.stayPlanRules,
						stayPlanstatus: plan.stayPlanstatus,
						createdAt: plan.createdAt,
						updatedAt: plan.updatedAt,
						inventories: invForPlan.map((inv) => ({
							_id: inv._id,
							roomTypeId: inv.roomTypeId,
							stayPlanId: inv.stayPlanId,
							inventoryDate: inv.inventoryDate,
							inventoryAllotment: inv.inventoryAllotment,
							inventoryPrice: inv.inventoryPrice,
							inventoryStatus: inv.inventoryStatus,
							createdAt: inv.createdAt,
							updatedAt: inv.updatedAt,
						})),
					};
				});

			return {
				...room,
				roomCount: rooms.length,
				stayPlans: plansForRoom,
			};
		});

		return {
			...property,
			memberData: memberData || null,
			rooms: roomsWithPlans,
			roomsCount: roomsWithPlans.length,
		};
	}

	// public async getProperty(memberId: ObjectId, input: PropertyInquiry): Promise<Property> {
	// 	const match: T = {
	// 		_id: shapeIntoMongoObjectId(input._id),
	// 		propertyName: input.propertyName,
	// 		propertyStatus: { $in: [PropertyStatus.DRAFT, PropertyStatus.ACTIVE] },
	// 	};

	// 	const targetProperty = await this.propertyModel
	// 		.aggregate([
	// 			{ $match: match },
	// 			{ $sort: { createdAt: 1 } },
	// 			{
	// 				$lookup: {
	// 					from: 'roomType',
	// 					localField: '_id',
	// 					foreignField: 'propertyId',
	// 					pipeline: [
	// 						// (선택) 룸 상태 필터
	// 						// { $match: { roomStatus: { $in: ['ACTIVE','DRAFT'] } } },

	// 						// 1-1) 각 roomType에 stayPlans 붙이기
	// 						{
	// 							$lookup: {
	// 								from: 'stayPlan',
	// 								localField: '_id',
	// 								foreignField: 'roomTypeId',
	// 								pipeline: [
	// 									// 1-2) 각 stayPlan에 inventories(날짜 범위) 붙이기
	// 									{
	// 										$lookup: {
	// 											from: 'inventory',
	// 											let: {
	// 												planId: '$_id',
	// 												roomId: '$roomTypeId',
	// 												fromDate: input.checkInDate,
	// 												toDate: input.checkOutDate,
	// 											},
	// 											pipeline: [
	// 												{
	// 													$match: {
	// 														$expr: {
	// 															$and: [
	// 																{ $eq: ['$stayPlanId', '$$planId'] },
	// 																{ $eq: ['$roomTypeId', '$$roomId'] },
	// 																// 날짜 범위: [fromDate, toDate)
	// 																{ $gte: ['$inventoryDate', '$$fromDate'] },
	// 																{ $lt: ['$inventoryDate', '$$toDate'] },
	// 															],
	// 														},
	// 													},
	// 												},
	// 												{
	// 													$project: {
	// 														_id: 1,
	// 														inventoryDate: 1,
	// 														inventoryAllotment: 1,
	// 														inventoryStatus: 1,
	// 														price: 1,
	// 													},
	// 												},
	// 												{ $sort: { inventoryDate: 1 } },
	// 											],
	// 											as: 'inventories',
	// 										},
	// 									},
	// 								],
	// 								as: 'stayPlans',
	// 							},
	// 						},
	// 					],
	// 					as: 'rooms',
	// 				},
	// 			},

	// 			// 2) roomCount 등 파생 필드
	// 			{ $addFields: { roomCount: { $size: { $ifNull: ['$rooms', []] } } } },

	// 			// 3) member join
	// 			lookupMember,
	// 			{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
	// 		])
	// 		.exec();

	// 	if (!targetProperty.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

	// 	// if (memberId) {
	// 	// 	const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY };
	// 	// 	const newView = await this.viewService.recordView(viewInput);

	// 	// 	if (newView) {
	// 	// 		await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 });
	// 	// 		targerProperty.propertyViews++;
	// 	// 	}

	// 	// 	const likeInput: LikeInput = {
	// 	// 		memberId: memberId,
	// 	// 		likeRefId: propertyId,
	// 	// 		likeGroup: LikeGroup.PROPERTY,
	// 	// 	};
	// 	// 	targerProperty.meLiked = await this.likeService.checkLikeExistence(likeInput);
	// 	// }

	// 	// targerProperty.memberData = await this.memberService.getMember(null, targerProperty.memberId);
	// 	return targetProperty[0];
	// }

	public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
		let { propertyStatus, deletedAt } = input;
		const search: T = {
			_id: input._id,
			memberId: memberId,
			propertyStatus: { $in: [PropertyStatus.DRAFT, PropertyStatus.ACTIVE] },
		};

		if (propertyStatus === PropertyStatus.DELETE) input.deletedAt = new Date();

		const result: Property = await this.propertyModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (input.deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberProperties',
				modifier: -1,
			});
		}

		return result;
	}

	public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
		const match: T = { propertyStatus: PropertyStatus.DRAFT };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		this.shapeMatchQuery(match, input);

		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// lookupAuthMemberLiked(memberId),
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
		const { memberId, location, type, pricesRange, text, propertyStarsList, soldAt, amenityList, otherAmenityList } =
			input.search;

		if (location) match.propertyLocation = location;
		if (soldAt) match.soldAt = soldAt;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (type) match.propertyType = type;
		if (amenityList) match.propertyAmenities = { $in: amenityList };
		if (otherAmenityList) match.propertyOtherAmenities = { $in: otherAmenityList };
		if (propertyStarsList && propertyStarsList.length) match.propertyStars = { $in: propertyStarsList };
		if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };

		if (text) match.propertyName = { $regex: new RegExp(text, 'i') };
	}

	// public async getFavorites(memebrId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
	// 	return await this.likeService.getFavoriteProperties(memebrId, input);
	// }

	// public async getVisited(memebrId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
	// 	return await this.viewService.getVisitedProperties(memebrId, input);
	// }

	public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
		const { propertyStatus } = input.search;
		if (propertyStatus === PropertyStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

		const match: T = {
			memberId: memberId,
			propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE },
		};
		console.log('match ;', match);
		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	// public async likeTargetProperty(memberId: ObjectId, liekRefId: ObjectId): Promise<Property> {
	// 	const targetProperty: Property = await this.propertyModel
	// 		.findOne({ _id: liekRefId, propertyStatus: PropertyStatus.ACTIVE })
	// 		.exec();

	// 	if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

	// 	const input: LikeInput = {
	// 		memberId: memberId,
	// 		likeGroup: LikeGroup.PROPERTY,
	// 		likeRefId: liekRefId,
	// 	};

	// 	const modifier = await this.likeService.toggleLike(input);
	// 	const result: Property = await this.propertyStatsEditor({
	// 		_id: liekRefId,
	// 		targetKey: 'propertyLikes',
	// 		modifier: modifier,
	// 	});

	// 	if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

	// 	return result;
	// }

	/** ADMIN **/
	public async getAllPropertiesByAdmin(memberId: ObjectId, input: AllPropertiesInquiry): Promise<Properties> {
		const { propertyStatus, location, propertyStarsList, type } = input.search;
		const match: T = {};
		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		if (propertyStatus) match.propertyStatus = propertyStatus;
		if (location) match.propertyLocation = location;
		if (propertyStarsList) match.propertyStars = { $in: propertyStarsList };
		if (type) match.propertyType = type;

		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property> {
		const { propertyStatus, deletedAt } = input;
		const search: T = {
			_id: input._id,
			propertyStatus: PropertyStatus.ACTIVE,
		};

		if (propertyStatus === PropertyStatus.DELETE) input.deletedAt = new Date();

		const result = await this.propertyModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (input.deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProperties',
				modifier: -1,
			});
		}

		return result;
	}

	public async removePropertyByAdmin(propertyId: ObjectId): Promise<Property> {
		const search: T = { _id: propertyId, propertyStatus: PropertyStatus.DELETE };
		const result: Property = await this.propertyModel.findOneAndDelete(search).exec();

		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
		const { _id, targetKey, modifier } = input;
		return await this.propertyModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true });
	}
}
