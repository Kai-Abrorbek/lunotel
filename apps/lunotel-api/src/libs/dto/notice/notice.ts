import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { NoticeCategory } from '../../enums/notice.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Notice {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	title: string;

	@Field(() => String)
	content: string;

	@Field(() => NoticeCategory)
	category: NoticeCategory;

	@Field(() => Boolean)
	isPinned: boolean;

	@Field(() => Int)
	views: number;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class Notices {
	@Field(() => [Notice])
	list: Notice[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter?: TotalCounter[];
}
