type MessageType = 'text' | 'file' | 'event'; // mirrors Prisma enum

type PrivateBaseMessage = {
  username: string | null;
  messageType: MessageType;
  roomId: string;
  timeStamp: Date;
  profilePicPath: string | null;
  userId: string | null;
  identifier: string;
  countryCode: string | null;
  gender: ('male'|'female'|'unknown') | null;
};

interface ClientPrivateTextMessage extends PrivateBaseMessage {
  messageType: 'text';
  textContent: string;
}


interface ClientPrivateFileMessageBeforeSend extends PrivateBaseMessage{
  messageType: 'file';
  bytes: Uint8Array | null;
}

interface ClientPrivateFileMessageWhenReceived extends ClientPrivateFileMessageBeforeSend {
  fileUrl: string | null;
  fileSize: number | null;
  mimeType: string | null;
  fileName: string;
  bytes: Uint8Array | null;
  fileType: string | null;
}


interface EventMessage extends PrivateBaseMessage {
  messageType: 'event';
  textContent: string;
  userId: 'event-user';

} 

type ClientPrivateMessage = ClientPrivateTextMessage | ClientPrivateFileMessageWhenReceived | EventMessage;



//* Other

type InviteToRoomMessage ={
  roomId: string;
  strangerInviteInfo: StrangerInfoPayload;
}

type StrangerInfoPayload ={
  //* Why null?
  //* Case 1:
  //* If the invitation is being sent from the user profile they will not need the socket ID.
  //* Case 2:
  //* If the invitation is being sent from the random chat, the user I D might not be defined which is handled properly.
  userId: string | null;
  socketId: string | null;
}