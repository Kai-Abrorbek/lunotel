import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import {
	AgentPropertiesInquiry,
	AllPropertiesInquiry,
	PropertiesInquiry,
	PropertyInput,
} from '../../libs/dto/property/property.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
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

	public async getProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property> {
		const search: T = {
			_id: propertyId,
			propertyStatus: PropertyStatus.DRAFT,
		};

		const targerProperty = await this.propertyModel.findOne(search).lean().exec();
		if (!targerProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		// if (memberId) {
		// 	const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY };
		// 	const newView = await this.viewService.recordView(viewInput);

		// 	if (newView) {
		// 		await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 });
		// 		targerProperty.propertyViews++;
		// 	}

		// 	const likeInput: LikeInput = {
		// 		memberId: memberId,
		// 		likeRefId: propertyId,
		// 		likeGroup: LikeGroup.PROPERTY,
		// 	};
		// 	targerProperty.meLiked = await this.likeService.checkLikeExistence(likeInput);
		// }

		targerProperty.memberData = await this.memberService.getMember(null, targerProperty.memberId);
		return targerProperty;
	}

	public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
		let { propertyStatus, deletedAt } = input;
		const search: T = {
			_id: input._id,
			memberId: memberId,
			propertyStatus: PropertyStatus.DRAFT,
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
		const { propertyStatus, propertyLocationList } = input.search;
		const match: T = {};
		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		if (propertyStatus) match.propertyStatus = propertyStatus;
		if (propertyLocationList) match.propertyLocation = { $in: propertyLocationList };

		console.log(match);
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
		console.log(propertyId);
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
