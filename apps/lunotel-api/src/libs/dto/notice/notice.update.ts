import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NoticeCategory } from '../../enums/notice.enum';

@InputType()
export class NoticeUpdateInput {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	title?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	content?: string;

	@IsOptional()
	@IsEnum(NoticeCategory)
	@Field(() => NoticeCategory, { nullable: true })
	category?: NoticeCategory;

	@IsOptional()
	@IsBoolean()
	@Field(() => Boolean, { nullable: true })
	isPinned?: boolean;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	views?: number;
}
