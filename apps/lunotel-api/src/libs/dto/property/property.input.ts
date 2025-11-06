import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import {
	PropertyAmenity,
	PropertyLocation,
	PropertyOtherAmenity,
	PropertyStatus,
	PropertyType,
} from '../../enums/property.enum';
import { ObjectId } from 'mongoose';
import { availablePropertySorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class PropertyInput {
	@IsNotEmpty()
	@Field(() => PropertyType)
	propertyType: PropertyType;

	@IsNotEmpty()
	@Field(() => PropertyLocation)
	propertyLocation: PropertyLocation;

	@IsNotEmpty()
	@Length(5, 100)
	@Field(() => String)
	propertyAddress: string;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	propertyName: string;

	@IsNotEmpty()
	@Field(() => Int)
	propertyPrice: number;

	@IsNotEmpty()
	@Field(() => Int)
	propertyStars: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	propertyRooms: number;

	@IsNotEmpty()
	@Field(() => [String])
	propertyImages: string[];

	@IsNotEmpty()
	@Field(() => [PropertyOtherAmenity])
	propertyAmenities: PropertyAmenity[];

	@IsNotEmpty()
	@Field(() => [PropertyOtherAmenity])
	propertyOtherAmenities: PropertyOtherAmenity[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	propertyDesc?: string;

	memberId?: ObjectId;
}

@InputType()
class PricesRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
class PIsearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

	@IsOptional()
	@Field(() => PropertyLocation, { nullable: true })
	location?: PropertyLocation;

	@IsOptional()
	@Field(() => PropertyType, { nullable: true })
	type?: PropertyType;

	@IsOptional()
	@Field(() => PricesRange, { nullable: true })
	pricesRange?: PricesRange;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class PropertiesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availablePropertySorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => PIsearch, { nullable: true })
	search?: PIsearch;
}

@InputType()
class APIsearch {
	@IsOptional()
	@Field(() => PropertyStatus, { nullable: true })
	propertyStatus?: PropertyStatus;
}

@InputType()
export class AgentPropertiesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availablePropertySorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => APIsearch, { nullable: true })
	search?: APIsearch;
}

@InputType()
class ALPIsearch {
	@IsOptional()
	@Field(() => PropertyStatus, { nullable: true })
	propertyStatus?: PropertyStatus;

	@IsOptional()
	@Field(() => [PropertyLocation], { nullable: true })
	propertyLocationList?: PropertyLocation[];
}

@InputType()
export class AllPropertiesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availablePropertySorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ALPIsearch, { nullable: true })
	search?: ALPIsearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;
}
