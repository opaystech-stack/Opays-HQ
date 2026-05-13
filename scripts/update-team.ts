import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const team = [
  { full_name: 'Fenelon Lamsasiri', role: 'CEO', email: 'lamsasiri@opays.tech' },
  { full_name: 'Evans SELEMANI', role: 'CTO', email: 'evans@opays.tech' },
  { full_name: 'Prince BAGHENI', role: 'SALES', email: 'prince@opays.tech' },
  { full_name: 'Patricia ZAMWANA', role: 'SALES', email: 'patricia@opays.tech' },
  { full_name: 'ZAINA BWALE GODLOVE', role: 'SALES', email: 'zaina@opays.tech' }
];

async function updateProfiles() {
  for (const member of team) {
    console.log(`Updating ${member.full_name}...`);
    // Find by name or update if exists
    const { data: existing } = await supabase.from('profiles').select('id').ilike('full_name', `%${member.full_name.split(' ')[0]}%`).limit(1).single();
    if (existing) {
      await supabase.from('profiles').update({ 
        full_name: member.full_name, 
        role: member.role 
      }).eq('id', existing.id);
    }
  }
}

updateProfiles();
