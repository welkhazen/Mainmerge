import { supabase } from '../client';
import type { CommunityChatMessageRecord, SendCommunityMessageInput } from '@/lib/communityChat.types';

export async function sendMessage(
  communityId: string,
  { senderId, senderName, text, replyToMessage }: SendCommunityMessageInput
): Promise<CommunityChatMessageRecord> {
  const { data, error } = await supabase
    .from('community_messages')
    .insert({
      community_id: communityId,
      sender_id: senderId,
      sender_name: senderName,
      text,
      reply_to_message_id: replyToMessage?.id ?? null,
      reply_to_sender_name: replyToMessage?.senderName ?? null,
      reply_to_text: replyToMessage?.text ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    communityId: data.community_id,
    senderId: data.sender_id,
    senderName: data.sender_name,
    text: data.text,
    createdAt: data.created_at,
    pinned: data.pinned,
    replyToMessageId: data.reply_to_message_id ?? undefined,
    replyToSenderName: data.reply_to_sender_name ?? undefined,
    replyToText: data.reply_to_text ?? undefined,
    likedBy: [],
  };
}

export async function deleteMessage(messageId: string, requesterId: string): Promise<void> {
  const { error } = await supabase
    .from('community_messages')
    .update({ deleted_at: new Date().toISOString(), deleted_by_user_id: requesterId })
    .eq('id', messageId);
  if (error) throw error;
}

export async function likeMessage(messageId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc('toggle_message_like', {
    p_message_id: messageId,
    p_user_id: userId,
  });
  if (error) throw error;
}
