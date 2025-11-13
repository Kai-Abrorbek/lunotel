import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';
import { FaqCategory } from '../../enums/faq.enum';

@InputType()
export class FaqUpdateInput {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	question?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	answer?: string;

	@IsOptional()
	@IsEnum(FaqCategory)
	@Field(() => FaqCategory, { nullable: true })
	category?: FaqCategory;

	@IsOptional()
	@IsBoolean()
	@Field(() => Boolean, { nullable: true })
	isActive?: boolean;
}
