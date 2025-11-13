import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { NoticeCategory } from '../../enums/notice.enum';

@InputType()
export class NoticeInput {
	@IsNotEmpty()
	@Field(() => String)
	title: string;

	@IsNotEmpty()
	@Field(() => String)
	content: string;

	@IsNotEmpty()
	@IsEnum(NoticeCategory)
	@Field(() => NoticeCategory)
	category: NoticeCategory;

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

@InputType()
export class NTSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	title?: string;

	@IsOptional()
	@Field(() => NoticeCategory, { nullable: true })
	category?: NoticeCategory;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	isPinned?: boolean;
}

@InputType()
export class NoticeInquiry {
	@IsNotEmpty()
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => NTSearch, { nullable: true })
	search?: NTSearch;
}
