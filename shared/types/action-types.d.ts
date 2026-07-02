type UserSession = {
	id: string;
	email: string;
	username: string;
	profilePicPath: string | null;
	countryCode: string | null;
	gender: ('male'|'female'|'unknown') | null;
	bio: string | null
};
type ActionResponse = {
	success: boolean;
	msg: string;
};

type SignUpPayload = {
	username: string;
	email: string;
	password: string;
};

type LogInPayload = {
	email: string;
	password: string;
};
interface LogInActionResponse extends ActionResponse {
	user: UserSession | null;
}

interface SignUpActionResponse extends ActionResponse {
	user: UserSession | null;
}

type CreateRoomPayload = {
	roomName: string;
	isPrivate: boolean;
};

type Room = {
	id: string;
	roomName: string;
	isPrivate: boolean;
	createdById: string;
};

type RoomMeta = {
	id: string;
	roomName: string;
	isPrivate: boolean;
	roomPicPath: string | null;
	createdBy: {
		id?: string;
		username?: string;
	};
	users: {
		id: string;
		username: string;
		profilePicPath: string | null;
		role: 'member' | 'admin';
	}[];
};


interface GetRoomMessagesActionResponse extends ActionResponse {
	messages: ClientPrivateMessage[]
}


interface CreateRoomActionResponse extends ActionResponse {
	room: Room | null;
}

interface SendFileActionResponse extends ActionResponse {
	fileUrl: string;
	fullFileName: string
}

interface PublicRoomsActionResponse extends ActionResponse {
	rooms: {
		roomName: string;
   		roomPicPath: string | null;
    	roomUserCount: number;
		unReadMessages: number | null
		id: string
	}[]
}

interface InviteUserOwnRoomActionResponse extends ActionResponse {
	rooms: {
		id: string;
		roomName: string;
		roomPicPath: string | null;
		unReadMessages: number | null;
		roomUserCount: number | null
	}[]
}

//* Other:
type Parser = (term: string) => string;

type RedisJsonUserResult = {
	userId: string;
	data: {
		username: string;
		profilePicPath: string | null
	};
};

interface UserSearchActionResponse extends ActionResponse {
	foundUsers: RedisJsonUserResult[] | null;
}
