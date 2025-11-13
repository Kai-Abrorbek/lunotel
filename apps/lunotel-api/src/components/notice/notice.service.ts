import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { InjectModel } from '@nestjs/mongoose';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { Message } from '../../libs/enums/common.enum';
import { NoticeUpdateInput } from '../../libs/dto/notice/notice.update';
import { T } from '../../libs/types/common';

@Injectable()
export class NoticeService {
	constructor(@InjectModel('NoticeSchema') private readonly noticeModel: Model<Notice>) {}

	public async createNotice(input: NoticeInput): Promise<Notice> {
		try {
			const result = await this.noticeModel.create(input);

			if (!result) throw new BadRequestException(Message.CREATE_FAILED);
			return result;
		} catch (err) {
			throw new BadRequestException(err);
		}
	}

	public async updateNotice(input: NoticeUpdateInput): Promise<Notice> {
		try {
			const result = await this.noticeModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();

			if (!result) throw new BadRequestException(Message.UPDATE_FAILED);
			return result;
		} catch (err) {
			throw new BadRequestException(err);
		}
	}

	public async getNotices(input: NoticeInquiry): Promise<Notices> {
		const { page, limit } = input;
		const match: T = {};

		if (input.search?.category) match.category = input.search.category;
		if (input.search?.title) match.title = { $regex: new RegExp(input.search.title, 'i') };
		if (input.search?.isPinned) match.isActive = input.search.isPinned;

		const data = await this.noticeModel
			.find(match)
			.skip((page - 1) * limit)
			.limit(limit)
			.exec();
		const result = { list: [], metaCounter: [{ total: data.length }] };
		result.list = data.map((ele) => ele);

		return result;
	}
}
