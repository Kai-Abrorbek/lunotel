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
