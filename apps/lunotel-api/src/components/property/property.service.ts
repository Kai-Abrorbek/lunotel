import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import {
	AgentPropertiesInquiry,
	AllPropertiesInquiry,
	OrdinaryInquiry,
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
	lookupMember,
	lookupRoomsForProperties,
	lookupRoomsForProperty,
	shapeIntoMongoObjectId,
} from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		private readonly memberService: MemberService,
		private readonly likeService: LikeService,
		private readonly viewService: ViewService,
	) {}

	/*****************
	 **  	ANY   **
	 *****************/
	public async getProperty(memberId: ObjectId, input: PropertyInquiry): Promise<Property> {
		const match: T = {
			_id: shapeIntoMongoObjectId(input._id),
			propertyName: input.propertyName,
			propertyStatus: { $in: [PropertyStatus.DRAFT, PropertyStatus.ACTIVE] },
		};

		const targetProperty = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: 1 } },
				lookupRoomsForProperty(input),
				{ $addFields: { roomCount: { $size: { $ifNull: ['$rooms', []] } } } },
				lookupMember,
				lookupAuthMemberLiked(memberId),
				{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
			])
			.exec();

		if (!targetProperty.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: input._id, viewGroup: ViewGroup.PROPERTY };
			const newView = await this.viewService.recordView(viewInput);

			if (newView) {
				await this.propertyStatsEditor({ _id: input._id, targetKey: 'propertyViews', modifier: 1 });
				targetProperty[0].propertyViews++;
			}
		}

		return targetProperty[0];
	}

	public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
		const search = input.search;
		const match: T = { propertyStatus: { $in: [PropertyStatus.DRAFT, PropertyStatus.ACTIVE] } };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		this.shapeMatchQuery(match, search);

		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupRoomsForProperties(input),
							lookupAuthMemberLiked(memberId),
							{ $addFields: { roomCount: { $size: { $ifNull: ['$rooms', []] } } } },

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

	private shapeMatchQuery(match: T, search: NonNullable<PropertiesInquiry['search']>): void {
		const {
			memberId,
			propertyName,
			propertyType,
			location,
			pricesRange,
			text,
			propertyStarsList,
			soldAt,
			amenityList,
			otherAmenityList,
		} = search;

		if (propertyType) match.propertyType = propertyType;
		if (location) match.propertyLocation = location;
		if (soldAt) match.soldAt = soldAt;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (amenityList) match.propertyAmenities = { $in: amenityList };
		if (otherAmenityList) match.propertyOtherAmenities = { $in: otherAmenityList };
		if (propertyStarsList && propertyStarsList.length) match.propertyStars = { $in: propertyStarsList };
		if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };

		if (text) match.propertyName = { $regex: new RegExp(text, 'i') };
		if (propertyName) match.propertyName = { $regex: new RegExp(text, 'i') };
	}
	/*****************
	 **  	USER   **
	 *****************/
	public async getFavorites(memebrId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		return await this.likeService.getFavoriteProperties(memebrId, input);
	}

	public async getVisited(memebrId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		return await this.viewService.getVisitedProperties(memebrId, input);
	}

	public async likeTargetProperty(memberId: ObjectId, likeRefId: ObjectId): Promise<Property> {
		const targetProperty: Property = await this.propertyModel
			.findOne({ _id: likeRefId, propertyStatus: PropertyStatus.DRAFT })
			.exec();

		console.log(targetProperty);
		if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeGroup: LikeGroup.PROPERTY,
			likeRefId: likeRefId,
		};

		const modifier = await this.likeService.toggleLike(input);
		const result: Property = await this.propertyStatsEditor({
			_id: likeRefId,
			targetKey: 'propertyLikes',
			modifier: modifier,
		});

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

		return result;
	}
	/*****************
	 **  	AGENT   **
	 *****************/
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

	public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
		const { propertyStatus, propertyId } = input.search;
		if (propertyStatus === PropertyStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

		const match: T = {
			memberId: memberId,
			propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE },
		};
		if (propertyId) match._id = propertyId;

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
							{
								$lookup: {
									from: 'reservation',
									localField: '_id',
									foreignField: 'propertyId',
									as: 'reservationData',
								},
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
	/*****************
	 **  	ADMIN   **
	 *****************/
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
