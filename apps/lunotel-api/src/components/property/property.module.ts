import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyResolver } from './property.resolver';

@Module({
  providers: [PropertyService, PropertyResolver]
})
export class PropertyModule {}
