import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';

@InputType()
export class RoomTypeInput {
	@IsNotEmpty()
	@Field(() => String)
	propertyId: ObjectId;

	@IsNotEmpty()
	@Length(5, 100)
	@Field(() => String)
	roomName: String;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	roomCapacity: Number;

	@IsNotEmpty()
	@IsInt()
	@Field(() => Int)
	roombasePrice: Number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	roombedInfo: String;

	@IsNotEmpty()
	@Field(() => [String])
	roomAmenities: [String];

	@IsNotEmpty()
	@Field(() => [String])
	roomImages: [String];
}
