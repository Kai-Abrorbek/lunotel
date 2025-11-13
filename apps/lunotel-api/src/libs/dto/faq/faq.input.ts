import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { FaqCategory } from '../../enums/faq.enum';
import { flushCompileCache } from 'module';

@InputType()
export class FaqInput {
	@IsNotEmpty()
	@Field(() => String)
	question: string;

	@IsNotEmpty()
	@Field(() => String)
	answer: string;

	@IsNotEmpty()
	@IsEnum(FaqCategory)
	@Field(() => FaqCategory)
	category: FaqCategory;

	@IsOptional()
	@IsBoolean()
	@Field(() => Boolean, { nullable: true })
	isActive?: boolean;
}

@InputType()
export class FQSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	question?: string;

	@IsOptional()
	@Field(() => FaqCategory, { nullable: true })
	category?: FaqCategory;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	isActive?: boolean;
}

@InputType()
export class FaqInquiry {
	@IsNotEmpty()
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => FQSearch, { nullable: true })
	search?: FQSearch;
}
