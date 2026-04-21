import { createClient } from '@supabase/supabase-js'

const url = 'https://zdqcnjwmahklqzzxqvcj.supabase.co'
const anonKey = 'sb_publishable_vIh_kvBsHvnJb1gaXqay6w_bHGyiU4P'

console.log('🔌 Testing Supabase Connection...\n')
console.log(`✓ URL: ${url}`)
console.log(`✓ Key: ${anonKey.slice(0, 30)}...`)

try {
  const supabase = createClient(url, anonKey)
  
  console.log('\n✅ Supabase client created successfully!')
  console.log('\nTesting database connection...')
  
  // Try to read from a public table
  const { data, error, status } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .limit(1)
  
  if (error) {
    console.log('\n⚠️  Database query result:')
    console.log('Status:', status)
    console.log('Error:', error.message)
    
    if (status === 401) {
      console.log('\n🔐 This is a permissions issue - expected without service_role key')
      console.log('The anon key has limited access due to RLS policies')
    } else if (status === 404) {
      console.log('\n❌ Table not found - migrations may not be applied')
    }
  } else {
    console.log('\n✅ Database connection successful!')
    console.log(`Found ${data.length} users`)
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 Summary:')
  console.log('✓ Supabase instance is reachable')
  console.log('✓ Client initialization works')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
} catch (error: any) {
  console.error('❌ Connection Error:', error.message)
}
