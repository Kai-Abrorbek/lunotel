import { registerEnumType } from '@nestjs/graphql';

export enum FaqCategory {
	RESERVATION = 'RESERVATION',
	PAYMENT = 'PAYMENT',
	CANCEL_REFUND = 'CANCEL_REFUND',
	ROOM_INFO = 'ROOM_INFO',
	CHECKIN_CHECKOUT = 'CHECKIN_CHECKOUT',
	FACILITIES = 'FACILITIES',
	COUPON_DISCOUNT = 'COUPON_DISCOUNT',
	ACCOUNT = 'ACCOUNT',
	LOCATION = 'LOCATION',
}
registerEnumType(FaqCategory, { name: 'FaqCategory' });

export enum FaqCategoryKorean {
	RESERVATION = '예약 관련',
	PAYMENT = '결제 / 영수증',
	CANCEL_REFUND = '취소 / 환불 규정',
	ROOM_INFO = '객실 안내',
	CHECKIN_CHECKOUT = '체크인 / 체크아웃',
	FACILITIES = '부대시설 / 조식 / 주차',
	COUPON_DISCOUNT = '쿠폰 / 할인',
	ACCOUNT = '회원 / 계정',
	LOCATION = '위치 / 교통',
}
registerEnumType(FaqCategoryKorean, { name: 'FaqCategoryKorean' });
