import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanup() {
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  
  for (const u of authUsers.users) {
      const { data: role } = await supabase.from('user_roles').select('*').eq('id', u.id).single()
      if (!role) {
          console.log(`Deleting orphaned user: ${u.email} (${u.id})`)
          await supabase.auth.admin.deleteUser(u.id)
      }
  }
}

cleanup()
