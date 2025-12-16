import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { AuthService } from '../auth/auth.service';
import { LoginInput, MembersInquiry, SignupInput } from '../../libs/dto/member/member.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberStatus } from '../../libs/enums/member.enum';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { StatisticModifier, T } from '../../libs/types/common';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly authService: AuthService,
	) {}

	public async socialLoginOrSignup(input: SignupInput): Promise<Member> {
		const { memberEmail, memberPassword, memberNick } = input;
		const respone: Member = await this.memberModel
			.findOne({ memberEmail: memberEmail })
			.select('+memberPassword')
			.exec();

		if (respone) {
			respone.accessToken = await this.authService.createToken(respone);
			return respone;
		}

		if (!respone || respone.memberStatus === MemberStatus.DELETE) {
			try {
				input.memberPassword = await this.authService.hashPassword(memberPassword);
				const result: Member = await this.memberModel.create(input);
				result.accessToken = await this.authService.createToken(result);
				return result;
			} catch (err) {
				throw new BadRequestException(err.message);
			}
		} else if (respone.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}
	}

	public async signup(input: SignupInput): Promise<Member> {
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		try {
			const result: Member = await this.memberModel.create(input);

			result.accessToken = await this.authService.createToken(result);

			return result;
		} catch (err) {
			console.log('err.message : ', err.message);
			throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		const { memberEmail, memberPassword } = input;
		const respone: Member = await this.memberModel
			.findOne({ memberEmail: memberEmail })
			.select('+memberPassword')
			.exec();

		if (!respone || respone.memberStatus === MemberStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
		} else if (respone.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		const isMatch = await this.authService.comparePasswords(memberPassword, respone.memberPassword);
		if (!isMatch) throw new InternalServerErrorException(Message.WRING_PASSWORD_KR);

		respone.accessToken = await this.authService.createToken(respone);
		return respone;
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		if (input.memberPassword) {
			input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		}

		const result: Member = await this.memberModel
			.findOneAndUpdate({ _id: memberId, memberStatus: MemberStatus.ACTIVE }, input, { new: true })
			.lean()
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		result.accessToken = await this.authService.createToken(result);

		return result;
	}

	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		const match: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};

		const targetMember = await this.memberModel
			.aggregate([
				{ $match: match },
				{
					$lookup: {
						from: 'reservation',
						localField: '_id',
						foreignField: 'memberId',
						as: 'reservationList',
					},
				},
			])
			.exec();
		if (!targetMember.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return targetMember[0];
	}

	/** ADMIN**/

	public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
		const { memberType, memberStatus, text } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createAt']: input?.direction ?? Direction.DESC };

		if (memberType) match.memberType = memberType;
		if (memberStatus) match.memberStatus = memberStatus;
		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
		if (input.memberPassword) {
			input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		}
		const result: Member = await this.memberModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		result.accessToken = await this.authService.createToken(result);
		return result;
	}

	public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
		const { _id, targetKey, modifier } = input;
		return await this.memberModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true });
	}
}
