import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import { Model } from 'mongoose';
import { FaqInput, FaqInquiry } from '../../libs/dto/faq/faq.input';
import { FaqUpdateInput } from '../../libs/dto/faq/faq.update';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class FaqService {
	constructor(@InjectModel('FaqSchema') private readonly faqModel: Model<Faq>) {}

	public async createFaq(input: FaqInput): Promise<Faq> {
		try {
			const result = await this.faqModel.create(input);

			if (!result) throw new BadRequestException(Message.CREATE_FAILED);
			return result;
		} catch (err) {
			throw new BadRequestException(err);
		}
	}

	public async updateFaq(input: FaqUpdateInput): Promise<Faq> {
		try {
			const result = await this.faqModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();

			if (!result) throw new BadRequestException(Message.UPDATE_FAILED);
			return result;
		} catch (err) {
			throw new BadRequestException(err);
		}
	}

	public async getFaqs(input: FaqInquiry): Promise<Faqs> {
		const { page, limit } = input;
		const match: T = {};

		if (input.search?.category) match.category = input.search.category;
		if (input.search?.question) match.question = { $regex: new RegExp(input.search.question, 'i') };
		if (input.search?.isActive) match.isActive = input.search.isActive;

		const data = await this.faqModel
			.find(match)
			.skip((page - 1) * limit)
			.limit(limit)
			.exec();
		const result = { list: [], metaCounter: [{ total: data.length }] };
		result.list = data.map((ele) => ele);

		return result;
	}
}
