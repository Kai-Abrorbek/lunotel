import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { FaqCategory } from '../../enums/faq.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Faq {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	question: string;

	@Field(() => String)
	answer: string;

	@Field(() => FaqCategory)
	category: FaqCategory;

	@Field(() => Boolean)
	isActive: boolean;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class Faqs {
	@Field(() => [Faq])
	list: Faq[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter?: TotalCounter[];
}
