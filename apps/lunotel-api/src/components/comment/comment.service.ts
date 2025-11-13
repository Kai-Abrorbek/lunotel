import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { PropertyService } from '../property/property.service';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { T } from '../../libs/types/common';
import { lookupMember } from '../../libs/config';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment>,
		private readonly memberService: MemberService,
		private readonly propertyService: PropertyService,
	) {}

	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
		input.memberId = memberId;
		let result = null;
		try {
			result = await this.commentModel.create(input);
		} catch (err) {
			console.log('Error, Service.Model', err.message);
			throw new BadGatewayException(Message.CREATE_FAILED);
		}

		switch (input.commentGroup) {
			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: input.commentRefId,
					targetKey: 'memberComments',
					modifier: 1,
				});
				break;

			case CommentGroup.PROPERTY:
				await this.propertyService.propertyStatsEditor({
					_id: input.commentRefId,
					targetKey: 'propertyComments',
					modifier: 1,
				});
				break;
		}

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return result;
	}

	public async updateComment(memebrId: ObjectId, input: CommentUpdate): Promise<Comment> {
		const targetComment = await this.commentModel
			.findOneAndUpdate(
				{
					_id: input._id,
					memberId: memebrId,
					commentStatus: CommentStatus.ACTIVE,
				},
				input,
				{ new: true },
			)
			.lean()
			.exec();

		if (!targetComment) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return targetComment;
	}

	public async getComments(memebrId: ObjectId, input: CommentsInquiry): Promise<Comments> {
		const { commentRefId } = input.search;
		const match: T = { commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };
		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		const result: Comments[] = await this.commentModel
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
									from: 'roomType',
									localField: 'commentTargetId',
									foreignField: '_id',
									as: 'roomDate',
								},
							},
							{ $unwind: '$roomDate' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async getMyComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
		const match: T = { memberId: memberId, commentStatus: CommentStatus.ACTIVE };
		if (input.search.commentRefId) match.commentRefId = input.search.commentRefId;

		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };
		console.log(match);

		const result: Comments[] = await this.commentModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'roomType',
									localField: 'commentTargetId',
									foreignField: '_id',
									as: 'roomDate',
								},
							},
							{ $unwind: '$roomDate' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	/** ADMIN **/
	public async removeCommentByAdmin(commentId: ObjectId): Promise<Comment> {
		const result = await this.commentModel.findOneAndDelete(commentId).exec();

		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}
}
