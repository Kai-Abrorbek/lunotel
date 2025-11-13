import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { CommentGroup } from '../../enums/comment.enum';
import { Direction } from '../../enums/common.enum';
import { availableCommentSorts } from '../../config';

@InputType()
export class CommentInput {
	@IsNotEmpty()
	@Field(() => CommentGroup)
	commentGroup: CommentGroup;

	@IsNotEmpty()
	@Field(() => Int)
	commentRating: number;

	@IsNotEmpty()
	@Field(() => String)
	commentContent: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	commentImages?: [string];

	@IsNotEmpty()
	@Field(() => String)
	commentRefId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	commentTargetId: ObjectId;

	memberId?: ObjectId;
}

@InputType()
class CISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	commentRefId?: ObjectId;
}

@InputType()
export class CommentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableCommentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => CISearch)
	search: CISearch;
}
