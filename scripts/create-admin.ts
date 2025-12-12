import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createAdmin() {
    try {
        // Criar usuário admin
        const { data: user, error } = await supabase.auth.admin.createUser({
            email: 'dasilvaandrecarlos@gmail.com',
            password: 'senhacm103048',
            email_confirm: true,
            user_metadata: {
                role: 'admin',
                name: 'Carlos André da Silva'
            }
        })

        if (error) {
            console.error('❌ Erro ao criar usuário:', error.message)
            return
        }

        console.log('✅ Usuário admin criado com sucesso!')
        console.log('📧 Email:', user.user?.email)
        console.log('🆔 User ID:', user.user?.id)
        console.log('\n🔑 Login:')
        console.log('   Email: dasilvaandrecarlos@gmail.com')
        console.log('   Senha: senhacm103048')
        console.log('\n👉 Acesse: http://localhost:3000/login')
    } catch (error: any) {
        console.error('❌ Erro:', error.message)
    }
}

createAdmin()
