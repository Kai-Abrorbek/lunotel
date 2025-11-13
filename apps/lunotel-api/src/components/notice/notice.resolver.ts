import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NoticeService } from './notice.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { NoticeUpdateInput } from '../../libs/dto/notice/notice.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class NoticeResolver {
	constructor(private readonly noticeService: NoticeService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Notice)
	public async createNotice(@Args('input') input: NoticeInput): Promise<Notice> {
		return await this.noticeService.createNotice(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Notice)
	public async updateNotice(@Args('input') input: NoticeUpdateInput): Promise<Notice> {
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.noticeService.updateNotice(input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Notices)
	public async getNotices(@Args('input') input: NoticeInquiry): Promise<Notices> {
		return await this.noticeService.getNotices(input);
	}
}
