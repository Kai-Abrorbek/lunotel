import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { MemberModule } from './components/member/member.module';
import { T } from './libs/types/common';
import { PropertyModule } from './components/property/property.module';
import { GraphQLJSONObject } from 'graphql-type-json';
import { DatabaseModule } from './database/database.module';
import { RoomtypeModule } from './components/roomtype/roomtype.module';
import { StayplanModule } from './components/stayplan/stayplan.module';
import { InventoryModule } from './components/inventory/inventory.module';
import { ReservationModule } from './components/reservation/reservation.module';
import { LikeModule } from './components/like/like.module';
import { ViewModule } from './components/view/view.module';
import { CommentModule } from './components/comment/comment.module';
import { FaqModule } from './components/faq/faq.module';
import { NoticeModule } from './components/notice/notice.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: true,
			uploads: false,
			autoSchemaFile: true,
			// resolvers: { JSONObject: GraphQLJSONObject },
			formatError: (error: T) => {
				const response = error?.extensions?.originalError ?? error?.extensions?.exception?.response;

				const rawMessages = response?.message ?? error?.extensions?.response?.message ?? error?.message;

				const messages = Array.isArray(rawMessages) ? rawMessages : [rawMessages];

				return {
					code: error?.extensions?.code ?? 'INTERNAL_SERVER_ERROR',
					message: messages.join(', '),
					details: messages,
				};
			},
		}),
		MemberModule,
		PropertyModule,
		DatabaseModule,
		RoomtypeModule,
		StayplanModule,
		InventoryModule,
		ReservationModule,
		LikeModule,
		ViewModule,
		CommentModule,
		FaqModule,
		NoticeModule,
	],
	controllers: [AppController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
