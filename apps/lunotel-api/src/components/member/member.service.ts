import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { AuthService } from '../auth/auth.service';
import { LoginInput, SignupInput } from '../../libs/dto/member/member.input';
import { Message } from '../../libs/enums/common.enum';
import { MemberStatus } from '../../libs/enums/member.enum';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { T } from '../../libs/types/common';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly authService: AuthService,
	) {}

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
		const { memberNick, memberPassword } = input;
		const respone: Member = await this.memberModel.findOne({ memberNick: memberNick }).select('+memberPassword').exec();

		if (!respone || respone.memberStatus === MemberStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
		} else if (respone.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		const isMatch = await this.authService.comparePasswords(memberPassword, respone.memberPassword);
		if (!isMatch) throw new InternalServerErrorException(Message.WRING_PASSWORD);

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
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};

		const targetMember: Member = await this.memberModel.findOne(search).exec();
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		// if (memberId) {
		// 	const viewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER };
		// 	const newVIew = await this.viewService.recordView(viewInput);

		// 	if (newVIew) {
		// 		await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }).exec();
		// 		targetMember.memberViews++;
		// 	}

		// 	const likeInput: LikeInput = {
		// 		memberId: memberId,
		// 		likeRefId: targetId,
		// 		likeGroup: LikeGroup.MEMBER,
		// 	};

		// 	targetMember.meLiked = await this.likeService.checkLikeExistence(likeInput);

		// 	targetMember.meFollowed = await this.checkSubscription(memberId, targetId);
		// }
		return targetMember;
	}
}
