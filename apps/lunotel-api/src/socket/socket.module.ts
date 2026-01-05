import { Module } from '@nestjs/common';
import { AuthModule } from '../components/auth/auth.module';
import { SupportAdminController } from './socket.controller';
import { SupportGateway } from './socket.gateway';

@Module({
	imports: [AuthModule],
	controllers: [SupportAdminController],
	providers: [SupportGateway], // 👈 이거 필수
})
export class SocketModule {}
