import { NestFactory } from '@nestjs/core';
import { LunotelBatchModule } from './batch.module';

async function bootstrap() {
	const app = await NestFactory.create(LunotelBatchModule);
	await app.listen(process.env.PORT_BATCH ?? 3002);
}
bootstrap();
