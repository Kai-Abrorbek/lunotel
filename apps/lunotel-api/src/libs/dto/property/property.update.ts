import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import {
	PropertyAmenity,
	PropertyLocation,
	PropertyOtherAmenity,
	PropertyStatus,
	PropertyType,
} from '../../enums/property.enum';

@InputType()
export class PropertyUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => PropertyStatus, { nullable: true })
	propertyStatus?: PropertyStatus;

	@IsOptional()
	@Field(() => PropertyType, { nullable: true })
	propertyType?: PropertyType;

	@IsOptional()
	@Field(() => PropertyLocation, { nullable: true })
	propertyLocation?: PropertyLocation;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	propertyAddress?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	propertyDetailAddress?: string;

	@IsOptional()
	@Length(3, 20)
	@Field(() => String, { nullable: true })
	propertyLat?: string;

	@IsOptional()
	@Length(3, 20)
	@Field(() => String, { nullable: true })
	propertyLng?: string;

	@IsOptional()
	@Length(5, 100)
	@Field(() => String, { nullable: true })
	propertyName?: string;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	propertyPrice?: number;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	propertyRooms?: number | any;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Field(() => Int, { nullable: true })
	propertyStars?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	propertyImages?: string[];

	@IsOptional()
	@Field(() => [PropertyAmenity], { nullable: true })
	propertyAmenities?: PropertyAmenity[];

	@IsOptional()
	@Field(() => [PropertyOtherAmenity], { nullable: true })
	propertyOtherAmenities?: PropertyOtherAmenity[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	propertyDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	soldAt?: boolean;

	deletedAt?: Date;
}
