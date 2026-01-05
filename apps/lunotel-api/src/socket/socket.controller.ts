import { Controller, Get, Query } from '@nestjs/common';
import { SupportGateway } from './socket.gateway';

@Controller('admin/support')
export class SupportAdminController {
	constructor(private readonly gateway: SupportGateway) {}

	@Get('rooms')
	getRooms() {
		return this.gateway.getRoomSummaries();
	}
	@Get('messages')
	getMessages(@Query('roomId') roomId: string): any {
		console.log(roomId);
		return this.gateway.getMessagesByRoom(roomId);
	}
}
