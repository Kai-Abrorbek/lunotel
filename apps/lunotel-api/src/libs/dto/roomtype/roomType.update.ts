import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { PropertyLocation, PropertyStatus, PropertyType } from '../../enums/property.enum';
import { RoomStatus } from '../../enums/propertyRoomtype.enum';

@InputType()
export class PropertyUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	roomName?: string;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	roomCapacity?: number;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	roombasePrice?: number;

	@IsOptional()
	@Length(5, 100)
	@Field(() => String, { nullable: true })
	roombedInfo?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	roomAmenities?: [string];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	roomImages?: [string];

	@IsOptional()
	@Field(() => RoomStatus, { nullable: true })
	roomStatus?: RoomStatus;
}
