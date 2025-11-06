import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { PropertyLocation, PropertyStatus, PropertyType } from '../../enums/property.enum';
import { RoomStatus } from '../../enums/propertyRoomtype.enum';

@ObjectType()
export class Property {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	propertyId: ObjectId;

	@Field(() => String)
	roomName: string;

	@Field(() => Number)
	roomCapacity: number;

	@Field(() => Number)
	roombasePrice: number;

	@Field(() => Number, { nullable: true })
	roomDiscountPrice?: number;

	@Field(() => String)
	roombedInfo: string;

	@Field(() => [String])
	roomAmenities: [string];

	@Field(() => [String])
	roomImages: [string];

	@Field(() => RoomStatus)
	roomStatus: RoomStatus;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
