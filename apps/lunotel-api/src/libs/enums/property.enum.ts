import { registerEnumType } from '@nestjs/graphql';

export enum PropertyType {
	MOTEL = 'MOTEL',
	HOTEL = 'HOTEL',
	PENSION = 'PENSION',
	POLL_VILLA = 'POLL_VILLA',
	CAMPING = 'CAMPING',
	GLAMPING = 'GLAMPING',
}
registerEnumType(PropertyType, {
	name: 'PropertyType',
});

export enum PropertyStatus {
	DRAFT = 'DRAFT',
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	BLOCKED = 'BLOCKED',
}
registerEnumType(PropertyStatus, {
	name: 'PropertyStatus',
});

export enum PropertyLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
	GANGNEUNG = 'GANGNEUNG',
	SOKCHO = 'SOKCHO',
	YEOSU = 'YEOSU',
}
registerEnumType(PropertyLocation, {
	name: 'PropertyLocation',
});

export enum PropertyAmenity {
	SAUNA = 'SAUNA',
	SWIMMING_POOL = 'SWIMMING_POOL',
	BARBECUE = 'BARBECUE',
	RESTAURANT = 'RESTAURANT',
	FINTESS = 'FINTESS',
	WATER_PARK = 'WATER_PARK',
	STALL = 'STALL',
	KITCHEN = 'KITCHEN',
	DRYER = 'DRYER',
	DEHYDRATOR = 'DEHYDRATOR',
}

registerEnumType(PropertyAmenity, {
	name: 'PropertyAmenity',
});

export enum PropertyOtherAmenity {
	BREAKFAST_PROVIDED = 'BREAKFAST PROVIDED',
	FREE_PARKING = 'FREE PARKING',
	PETS_ALLOWED = 'PETS ALLOWED',
	SAUNA_JJIMJILBANG = 'SAUNA/JJIMJILBANG',
	IN_ROOM_COOKING = 'IN-ROOM COOKING',
	PICK_UP_SERVICE = 'PICK-UP SERVICE',
	SMOKING_ALLOWED = 'SMOKING ALLOWED',
	LUGGAGE_STORAGE = 'LUGGAGE STORAGE AVAILABLE',
}

registerEnumType(PropertyOtherAmenity, {
	name: 'PropertyOtherAmenity',
});
