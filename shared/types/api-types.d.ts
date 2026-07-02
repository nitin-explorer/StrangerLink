type ServerResponse = {
	success: boolean;
	msg: string;
};



interface ServerGetUserRooms extends ServerResponse {
	rooms: userRoom[] 
}

type userRoom = {
	role: 'admin' | 'member';
	roomName: string;
	id: string;
	isPrivate: boolean;
	roomPicPath: string;
	unReadMessages: number;
	createdBy: {
		id: string;
		username: string;
	};
	roomUserCount: number | null
}; 
