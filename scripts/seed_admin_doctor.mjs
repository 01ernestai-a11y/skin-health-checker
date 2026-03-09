import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase credentials in env")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setup() {
    console.log("Starting account provisioning...")

    // 1. Create Admin
    const adminPhone = '77700000000'
    const adminEmail = `${adminPhone}@skinchecker.local`
    const adminPassword = 'AdminPassword123!'

    const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
    })

    // We handle potential existing users softly
    if (adminErr) {
        console.error("Error creating admin auth:", adminErr.message)
    } else if (adminAuth?.user) {
        const { error: roleErr } = await supabase.from('user_roles').insert({ id: adminAuth.user.id, role: 'admin' })
        if (roleErr) console.error("Admin role insert error:", roleErr.message)
        else console.log(`✓ Admin created - Phone: ${adminPhone}, Password: ${adminPassword}`)
    }

    // 2. Create Doctor
    const docPhone = '77711111111'
    const docEmail = `${docPhone}@skinchecker.local`
    const docPassword = 'DoctorPassword123!'

    const { data: docAuth, error: docErr } = await supabase.auth.admin.createUser({
        email: docEmail,
        password: docPassword,
        email_confirm: true,
    })

    if (docErr) {
        console.error("Error creating doctor auth:", docErr.message)
    } else if (docAuth?.user) {
        const { error: dRoleErr } = await supabase.from('user_roles').insert({ id: docAuth.user.id, role: 'doctor' })
        if (dRoleErr) console.error("Doctor role insert error:", dRoleErr.message)

        const { error: docTableErr } = await supabase.from('doctors').insert({
            id: docAuth.user.id,
            name: 'Gregory',
            surname: 'House',
            specialization: 'Diagnostic Medicine & Dermatology'
        })
        if (docTableErr) console.error("Doctor table insert error:", docTableErr.message)
        else console.log(`✓ Doctor created - Phone: ${docPhone}, Password: ${docPassword}`)
    }

    console.log("Account provisioning completed.")
}

setup()
