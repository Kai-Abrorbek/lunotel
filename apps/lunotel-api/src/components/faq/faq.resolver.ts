import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FaqService } from './faq.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import { FaqInput, FaqInquiry } from '../../libs/dto/faq/faq.input';
import { FaqUpdateInput } from '../../libs/dto/faq/faq.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class FaqResolver {
	constructor(private readonly faqService: FaqService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Faq)
	public async createFaq(@Args('input') input: FaqInput): Promise<Faq> {
		return await this.faqService.createFaq(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Faq)
	public async updateFaq(@Args('input') input: FaqUpdateInput): Promise<Faq> {
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.faqService.updateFaq(input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Faqs)
	public async getFaqs(@Args('input') input: FaqInquiry): Promise<Faqs> {
		return await this.faqService.getFaqs(input);
	}
}
