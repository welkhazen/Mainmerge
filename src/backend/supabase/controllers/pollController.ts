import { supabase } from '../client';
import type { AdminPoll, PollOptionRow } from '../models/poll';

export async function fetchPolls(): Promise<AdminPoll[]> {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      id,
      question,
      status,
      created_at,
      poll_options (
        id,
        label,
        position
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const options = [...((row.poll_options as PollOptionRow[]) ?? [])]
      .sort((a, b) => a.position - b.position);
    return {
      id: row.id as string,
      question: row.question as string,
      options: options.map((opt) => ({ id: opt.id, text: opt.label, votes: 0 })),
      locked: row.status === 'locked',
      createdAt: row.created_at as string,
    };
  });
}

export async function insertPoll(poll: AdminPoll): Promise<void> {
  const { error: pollError } = await supabase.from('polls').insert({
    id: poll.id,
    question: poll.question,
    status: poll.locked ? 'locked' : 'active',
    is_onboarding: false,
    created_at: poll.createdAt,
  });
  if (pollError) throw pollError;

  if (poll.options.length > 0) {
    const { error: optionsError } = await supabase.from('poll_options').insert(
      poll.options.map((opt, i) => ({
        id: opt.id,
        poll_id: poll.id,
        label: opt.text,
        position: i,
      }))
    );
    if (optionsError) throw optionsError;
  }
}

export async function deletePoll(pollId: string): Promise<void> {
  await supabase.from('poll_votes').delete().eq('poll_id', pollId);
  await supabase.from('poll_options').delete().eq('poll_id', pollId);
  const { error } = await supabase.from('polls').delete().eq('id', pollId);
  if (error) throw error;
}
