export type ModerationStatus = "accepted" | "pending" | "rejected";

export type ChatMessageDto = {
  id: string;
  roomSlug: string;
  senderId: string;
  senderName: string;
  content: string;
  moderationStatus: ModerationStatus;
  createdAt: string;
  editedAt?: string;
};

export const INITIAL_CHAT_ROOMS = [
  { slug: "usmle-1", name: "USMLE-1" },
  { slug: "usmle-2", name: "USMLE-2" },
  { slug: "usmle-3", name: "USMLE-3" },
  { slug: "residency-interviews", name: "RESIDENCY-INTERVIEWS" },
] as const;
