// import { ObjectId } from 'bson';
import { ObjectId } from 'bson';
export const availableAgentSorts = ['createdAt', 'updatedAt', 'memberViews', 'memberLikes', 'memberRank'];
export const availableMembersSorts = ['createdAt', 'updatedAt', 'memberViews', 'memberLikes'];
export const availablePropertySorts = [
	'createdAt',
	'updatedAt',
	'propertyViews',
	'propertyLikes',
	'propertyRank',
	'propertyPrice',
	'propertyReservations',
	'propertyComments',
];
export const availableBoardArticlesSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];

/* IMAGE CONFIGURATION */
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';
import { PipelineStage } from 'mongoose';
import { PropertiesInquiry, PropertyInquiry } from './dto/property/property.input';
import { Inventory } from './dto/inventory/inventory';
import { InventoryStatus } from './enums/inventory.enum';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
	return {
		$lookup: {
			from: 'likes',
			let: {
				localLikeRefId: targetRefId,
				localMemberId: memberId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						memberId: 1,
						likeRefId: 1,
						myFavorite: '$$localMyFavorite',
					},
				},
			],
			as: 'meLiked',
		},
	};
};

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId', //property.memberId
		foreignField: '_id', // member._id
		as: 'memberData',
	},
};

export const lookupRoomsForProperties = (input: PropertiesInquiry): PipelineStage.Lookup => {
	return {
		$lookup: {
			from: 'roomType',
			let: {
				roomId: '$_id',
				inputPersonal: input.search.personal,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$propertyId', '$$roomId'] }, { $gte: ['$roomMaxPersonal', '$$inputPersonal'] }],
						},
					},
				},
				{
					$lookup: {
						from: 'stayPlan',
						localField: '_id',
						foreignField: 'roomTypeId',
						pipeline: [
							{
								$lookup: {
									from: 'inventory',
									let: {
										status: InventoryStatus.OPEN,
										planId: '$_id',
										roomId: '$roomTypeId',
										fromDate: input.search.checkInDate,
										toDate: input.search.checkOutDate,
									},
									pipeline: [
										{
											$match: {
												$expr: {
													$and: [
														{ $eq: ['$inventoryStatus', '$$status'] },
														{ $eq: ['$stayPlanId', '$$planId'] },
														{ $eq: ['$roomTypeId', '$$roomId'] },
														{ $gte: ['$inventoryDate', '$$fromDate'] },
														{ $lt: ['$inventoryDate', '$$toDate'] },
													],
												},
											},
										},
										{
											$project: {
												_id: 1,
												roomTypeId: 1,
												stayPlanId: 1,
												inventoryDate: 1,
												inventoryAllotment: 1,
												inventoryPrice: 1,
												inventoryStatus: 1,
												createdAt: 1,
												updatedAt: 1,
											},
										},
										{ $sort: { inventoryDate: 1 } },
									],
									as: 'inventories',
								},
							},
						],
						as: 'stayPlans',
					},
				},
			],
			as: 'rooms',
		},
	};
};

export const lookupRoomsForProperty = (input: PropertyInquiry): PipelineStage.Lookup => {
	return {
		$lookup: {
			from: 'roomType',
			let: {
				roomId: '$_id',
				inputPersonal: input.personal,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$propertyId', '$$roomId'] }, { $gte: ['$roomMaxPersonal', '$$inputPersonal'] }],
						},
					},
				},
				{
					$lookup: {
						from: 'stayPlan',
						localField: '_id',
						foreignField: 'roomTypeId',
						pipeline: [
							{
								$lookup: {
									from: 'inventory',
									let: {
										status: InventoryStatus.OPEN,
										planId: '$_id',
										roomId: '$roomTypeId',
										fromDate: input.checkInDate,
										toDate: input.checkOutDate,
									},
									pipeline: [
										{
											$match: {
												$expr: {
													$and: [
														{ $eq: ['$inventoryStatus', '$$status'] },
														{ $eq: ['$stayPlanId', '$$planId'] },
														{ $eq: ['$roomTypeId', '$$roomId'] },
														{ $gte: ['$inventoryDate', '$$fromDate'] },
														{ $lt: ['$inventoryDate', '$$toDate'] },
													],
												},
											},
										},
										{
											$project: {
												_id: 1,
												roomTypeId: 1,
												stayPlanId: 1,
												inventoryDate: 1,
												inventoryAllotment: 1,
												inventoryPrice: 1,
												inventoryStatus: 1,
												createdAt: 1,
												updatedAt: 1,
											},
										},
										{ $sort: { inventoryDate: 1 } },
									],
									as: 'inventories',
								},
							},
						],
						as: 'stayPlans',
					},
				},
			],
			as: 'rooms',
		},
	} as PipelineStage.Lookup;
};

export const lookupFavorite = {
	$lookup: {
		from: 'members',
		localField: 'favoriteProperty.memberId',
		foreignField: '_id',
		as: 'favoriteProperty.memberData',
	},
};

export const lookupVisited = {
	$lookup: {
		from: 'members',
		localField: 'visitedProperty.memberId',
		foreignField: '_id',
		as: 'visitedProperty.memberData',
	},
};
