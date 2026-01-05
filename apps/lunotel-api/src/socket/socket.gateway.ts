// support.gateway.ts
import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import * as url from 'url';
import { AuthService } from '../components/auth/auth.service';
import { Member } from '../libs/dto/member/member';

interface SupportMessage {
	event: 'message';
	roomId: string;
	text: string;
	from: 'AGENT' | 'USER' | 'GUEST';
	memberData: Pick<Member, '_id' | 'memberNick' | 'memberImage'> | null;
	at: number;
}

interface OnlineUsersPayload {
	event: 'onlineUsers';
	roomId: string;
	totalClients: number;
	users: Array<Pick<Member, '_id' | 'memberNick' | 'memberImage'>>;
	at: number;
}

@WebSocketGateway({ path: '/ws' })
export class SupportGateway implements OnGatewayInit {
	constructor(private authService: AuthService) {}

	@WebSocketServer()
	server: Server;
	private readonly ADMIN_LOBBY = 'adminLobby';
	private logger = new Logger('SupportGateway');

	private clientsAuthMap = new Map<WebSocket, Member | null>(); // 소켓 → 멤버
	private clientRoomMap = new Map<WebSocket, string>(); // 소켓 → roomId
	private roomClients = new Map<string, Set<WebSocket>>(); // roomId → 소켓 set
	private roomMessages = new Map<string, SupportMessage[]>(); // roomId → 최근 메시지

	afterInit() {
		this.logger.log('Support WS Initialized');
	}

	private ensureRoom(roomId: string) {
		if (!this.roomClients.has(roomId)) this.roomClients.set(roomId, new Set());
		if (!this.roomMessages.has(roomId)) this.roomMessages.set(roomId, []);
	}

	private parseQuery(req: any) {
		const parsed = url.parse(req.url, true);
		const token = (parsed.query.token as string) || '';
		const roomId = (parsed.query.roomId as string) || '';
		return { token, roomId };
	}

	private async retrieveAuth(req: any): Promise<Member | null> {
		try {
			const { token } = this.parseQuery(req);
			if (!token) return null;
			return await this.authService.verifyToken(token);
		} catch {
			return null;
		}
	}

	private toSafeMember(member: Member | null) {
		if (!member) return null;
		return {
			_id: member._id,
			memberNick: member.memberNick,
			memberImage: (member as any).memberImage,
		};
	}

	private isAdmin(member: Member | null): boolean {
		// ✅ 너 프로젝트의 role 필드명에 맞춰 수정
		return (member as Member)?.memberType === 'AGENT';
	}

	// ✅ 유저는 자기 support 방만, 어드민은 support:* 전체 허용
	private canJoinRoom(member: Member | null, roomId: string): boolean {
		if (roomId === this.ADMIN_LOBBY) return this.isAdmin(member);
		if (!roomId?.startsWith('support:')) return false;
		if (this.isAdmin(member)) return true;
		const userId = member?._id;
		if (!userId) return false;

		return roomId === `support:${userId}`;
	}

	private emitToRoom(roomId: string, message: any) {
		const sockets = this.roomClients.get(roomId);
		if (!sockets) return;

		sockets.forEach((ws) => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify(message));
			}
		});
	}

	private emitOnlineUsers(roomId: string) {
		const sockets = this.roomClients.get(roomId);
		if (!sockets) return;

		const uniq = new Map<string, any>();

		[...sockets].forEach((ws) => {
			const m = this.clientsAuthMap.get(ws);
			if (!m?._id) return;

			uniq.set(String(m._id), {
				_id: m._id,
				memberNick: m.memberNick,
				memberImage: (m as Member).memberImage,
			});
		});

		const users = [...uniq.values()];

		this.emitToRoom(roomId, {
			event: 'onlineUsers',
			roomId,
			totalClients: sockets.size,
			users,
			at: Date.now(),
		});
	}

	async handleConnection(client: WebSocket, req: any) {
		const member = await this.retrieveAuth(req);
		const { roomId } = this.parseQuery(req);
		// ✅ 방 id는 프론트가 보내지만, 서버가 최종 승인한다
		if (!this.canJoinRoom(member, roomId)) {
			client.close(1008, 'Unauthorized or invalid roomId'); // 권한 없음
			return;
		}

		this.ensureRoom(roomId);

		this.clientsAuthMap.set(client, member);
		this.clientRoomMap.set(client, roomId);
		this.roomClients.get(roomId)!.add(client);

		const nick = member?.memberNick ?? 'Guest';
		this.logger.verbose(`JOIN room=[${roomId}] nick=[${nick}] admin=[${this.isAdmin(member)}]`);

		// ✅ 히스토리(최근 50개)
		client.send(
			JSON.stringify({
				event: 'getMessages',
				roomId,
				list: this.roomMessages.get(roomId),
			}),
		);

		// ✅ 온라인 목록 갱신
		this.emitOnlineUsers(roomId);
	}

	handleDisconnect(client: WebSocket) {
		const roomId = this.clientRoomMap.get(client);
		if (!roomId) return;

		this.roomClients.get(roomId)?.delete(client);
		this.clientsAuthMap.delete(client);
		this.clientRoomMap.delete(client);

		// 방 비면 정리(선택)
		if ((this.roomClients.get(roomId)?.size ?? 0) === 0) {
			this.roomClients.delete(roomId);
			this.roomMessages.delete(roomId);
			return;
		}

		// ✅ 온라인 목록 갱신
		this.emitOnlineUsers(roomId);
	}

	// 프론트: ws.send(JSON.stringify({ event:'message', text:'...' }))
	@SubscribeMessage('message')
	handleMessage(client: WebSocket, payload: { text: string }) {
		const roomId = this.clientRoomMap.get(client);
		if (!roomId) return;

		const text = payload?.text ?? '';
		if (!text.trim()) return;

		const member = this.clientsAuthMap.get(client) ?? null;
		const from: SupportMessage['from'] = this.isAdmin(member) ? 'AGENT' : member?._id ? 'USER' : 'GUEST';

		const msg: SupportMessage = {
			event: 'message',
			roomId,
			text,
			from,
			memberData: this.toSafeMember(member),
			at: Date.now(),
		};

		const list = this.roomMessages.get(roomId)!;
		list.push(msg);
		if (list.length > 50) list.shift();

		this.emitToRoom(roomId, msg);
	}

	public getRoomSummaries() {
		const result: Array<{
			roomId: string;
			user: {
				_id: string;
				memberNick?: string;
				memberImage?: string;
			} | null;
			lastMessage: string;
			lastAt: number;
			onlineCount: number;
		}> = [];

		for (const [roomId, list] of this.roomMessages.entries()) {
			const last = list[list.length - 1];
			const onlineCount = this.roomClients.get(roomId)?.size ?? 0;
			const user =
				last?.memberData && last.from === 'USER'
					? {
							_id: String(last.memberData._id),
							memberNick: last.memberData.memberNick,
							memberImage: last.memberData.memberImage,
						}
					: null;

			result.push({
				roomId,
				user,
				lastMessage: last?.text ?? '',
				lastAt: last?.at ?? 0,
				onlineCount,
			});
		}

		result.sort((a, b) => b.lastAt - a.lastAt);
		return result;
	}

	public getMessagesByRoom(roomId: string) {
		return this.roomMessages.get(roomId) ?? [];
	}
}
