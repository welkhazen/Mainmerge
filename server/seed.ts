import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const polls = [
  {
    id: "3c360b64-2e6e-4444-9999-000000000001",
    question: "Do you believe your thoughts shape your reality?",
    options: ["Yes", "No"],
  },
  {
    id: "3c360b64-2e6e-4444-9999-000000000002",
    question: "Do you think social media does more harm than good?",
    options: ["Yes", "No"],
  },
  {
    id: "3c360b64-2e6e-4444-9999-000000000003",
    question: "Would you sacrifice comfort for personal growth?",
    options: ["Yes", "No"],
  },
];

async function seed() {
  console.log('Seeding polls...');

  for (const poll of polls) {
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .upsert({ id: poll.id, question: poll.question }, { onConflict: 'id' })
      .select()
      .single();

    if (pollError) {
      console.error(`Error seeding poll ${poll.id}:`, pollError);
      continue;
    }

    console.log(`Seeded poll: ${pollData.question}`);

    for (const optionText of poll.options) {
      // Check if option exists
      const { data: existingOption } = await supabase
        .from('poll_options')
        .select('id')
        .eq('poll_id', pollData.id)
        .eq('option_text', optionText)
        .single();

      if (!existingOption) {
        const { error: optionError } = await supabase
          .from('poll_options')
          .insert({ poll_id: pollData.id, option_text: optionText });

        if (optionError) {
          console.error(`Error seeding option for poll ${poll.id}:`, optionError);
        }
      }
    }
  }

  // Seed some communities
  const communities = [
    { name: "Mindfulness", slug: "mindfulness", description: "Exploring the power of the mind." },
    { name: "Tech & Society", slug: "tech-society", description: "Impact of technology on our lives." },
    { name: "Personal Growth", slug: "personal-growth", description: "Become the best version of yourself." },
  ];

  console.log('Seeding communities...');
  for (const community of communities) {
    const { error } = await supabase
      .from('communities')
      .upsert(community, { onConflict: 'slug' });
    
    if (error) {
      console.error(`Error seeding community ${community.slug}:`, error);
    } else {
      console.log(`Seeded community: ${community.name}`);
    }
  }

  console.log('Done seeding.');
}

seed();
