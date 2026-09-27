import mongoose, { Schema, type Model } from "mongoose";
import type { ChatMessageDto, ModerationStatus } from "@/lib/chat/types";

export type PrivateGroupStatus = "pending" | "approved" | "denied" | "closed";
export type RoomMember = {
  userId: string;
  username: string;
  addedAt: Date;
};
export type Room = {
  slug: string;
  name: string;
  topic: string | null;
  createdBy?: string;
  creatorUsername?: string;
  visibility: "public" | "private";
  status: PrivateGroupStatus;
  reason?: string;
  goal?: string;
  members: RoomMember[];
  reviewedBy?: string;
  reviewedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
type Message = {
  roomSlug: string;
  senderId: string;
  senderName: string;
  content: string;
  moderationStatus: ModerationStatus;
  riskScore: number;
  moderationReasons: string[];
  createdAt: Date;
  updatedAt: Date;
};
type Ban = {
  roomSlug: string;
  userId: string;
  bannedBy: string;
  reason?: string;
  createdAt: Date;
};
export type NotificationType =
  | "private_group_request"
  | "private_group_approved"
  | "private_group_denied"
  | "private_group_deleted"
  | "private_group_member_added"
  | "feature_pulse"
  | "feature_comment"
  | "chat_mention";
export type Notification = {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  relatedGroupId?: string;
  relatedFeatureId?: string;
  relatedMessageId?: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const RoomMemberSchema = new Schema<RoomMember>(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    addedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const RoomSchema = new Schema<Room>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    topic: String,
    createdBy: String,
    creatorUsername: String,
    visibility: {
      type: String,
      enum: ["public", "private"],
      required: true,
      default: "public",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied", "closed"],
      required: true,
      default: "approved",
      index: true,
    },
    reason: String,
    goal: String,
    members: { type: [RoomMemberSchema], default: [] },
    reviewedBy: String,
    reviewedAt: Date,
    closedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);
const MessageSchema = new Schema<Message>(
  {
    roomSlug: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    moderationStatus: {
      type: String,
      enum: ["accepted", "pending", "rejected"],
      required: true,
      index: true,
    },
    riskScore: { type: Number, required: true },
    moderationReasons: [String],
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);
MessageSchema.index({ roomSlug: 1, createdAt: -1 });
const BanSchema = new Schema<Ban>(
  {
    roomSlug: { type: String, required: true },
    userId: { type: String, required: true },
    bannedBy: { type: String, required: true },
    reason: String,
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);
BanSchema.index({ roomSlug: 1, userId: 1 }, { unique: true });
const NotificationSchema = new Schema<Notification>(
  {
    recipientId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        "private_group_request",
        "private_group_approved",
        "private_group_denied",
        "private_group_deleted",
        "private_group_member_added",
        "feature_pulse",
        "feature_comment",
        "chat_mention",
      ],
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    href: { type: String, required: true },
    relatedGroupId: String,
    relatedFeatureId: String,
    relatedMessageId: { type: String, index: true },
    readAt: Date,
  },
  { timestamps: true },
);
NotificationSchema.index({ recipientId: 1, readAt: 1, createdAt: -1 });
NotificationSchema.index(
  { recipientId: 1, relatedMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "chat_mention" },
  },
);

export const ChatRoom: Model<Room> =
  mongoose.models.ChatRoom || mongoose.model<Room>("ChatRoom", RoomSchema);
export const ChatMessage: Model<Message> =
  mongoose.models.ChatMessage ||
  mongoose.model<Message>("ChatMessage", MessageSchema);
export const ChatBan: Model<Ban> =
  mongoose.models.ChatBan || mongoose.model<Ban>("ChatBan", BanSchema);
export const ChatNotification: Model<Notification> =
  mongoose.models.ChatNotification ||
  mongoose.model<Notification>("ChatNotification", NotificationSchema);

export async function connectChatDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required for chat rooms.");
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || "medinexus",
  });
}

export function messageDto(
  message: mongoose.HydratedDocument<Message>,
): ChatMessageDto {
  return {
    id: message.id,
    roomSlug: message.roomSlug,
    senderId: message.senderId,
    senderName: message.senderName,
    content: message.content,
    moderationStatus: message.moderationStatus,
    createdAt: message.createdAt.toISOString(),
    editedAt:
      message.updatedAt.getTime() > message.createdAt.getTime()
        ? message.updatedAt.toISOString()
        : undefined,
  };
}
