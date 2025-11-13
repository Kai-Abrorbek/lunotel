import { registerEnumType } from '@nestjs/graphql';

export enum NoticeCategory {
	SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
	SERVICE_UPDATE = 'SERVICE_UPDATE',
	POLICY_CHANGE = 'POLICY_CHANGE',
	EVENT_PROMOTION = 'EVENT_PROMOTION',
	PRICE_UPDATE = 'PRICE_UPDATE',
	OPERATION_HOURS = 'OPERATION_HOURS',
	EMERGENCY = 'EMERGENCY',
}
registerEnumType(NoticeCategory, { name: 'NoticeCategory' });

export enum NoticeCategoryKorean {
	SYSTEM_MAINTENANCE = '시스템 점검',
	SERVICE_UPDATE = '서비스 업데이트',
	POLICY_CHANGE = '정책 변경',
	EVENT_PROMOTION = '이벤트 / 프로모션',
	PRICE_UPDATE = '요금 변경',
	OPERATION_HOURS = '운영 시간 변경',
	EMERGENCY = '긴급 공지',
}
registerEnumType(NoticeCategoryKorean, { name: 'NoticeCategoryKorean' });
