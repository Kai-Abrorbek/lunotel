import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { T } from './libs/types/common';
import { DatabaseModule } from './database/database.module';
import { ComponentsModule } from './components/components.module';
import { SocketModule } from './socket/socket.module';

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
		DatabaseModule,
		ComponentsModule,
		SocketModule,
	],
	controllers: [AppController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
