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

@Module({
	imports: [
		ConfigModule.forRoot(),
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: true,
			uploads: false,
			autoSchemaFile: true,
			formatError: (error: T) => {
				const graphqlFormatedError = {
					code: error?.extensions?.code,
					message:
						error?.extensions?.originalError?.message ||
						error?.message ||
						error?.extensions?.exception?.respone.message ||
						error?.extensions?.respone?.message,
				};
				console.log('GRAPHQL GLOBAL ERR: ', graphqlFormatedError);
				return graphqlFormatedError;
			},
		}),
		MemberModule,
		PropertyModule,
	],
	controllers: [AppController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
