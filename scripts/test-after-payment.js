// Testar acesso à conta CA01 após pagamento resolvido
const META_ACCESS_TOKEN = 'EAAT55cHV1XcBQNpuWBZAga6WGxNk0gyiPF5am2j8cdrVYdA8ByDJZAUQZAGaOsgqgEDea6knsxNEh228Oce0sZAbbJ5U6oqLYO6DlLdc63nDvmDbwyPaPxQBLtTPCdUABaYPFhLyaPtbY5Kt9wTGW3jRwteaZAr7GOXGCgW7ZBZBLLdd1dowkpSJBsojPgrQA6PPBZB74d9D8Rbpa4xwB0ENTW5ET3ZB5omP6WWGAZAOhnplKtWqZCs'
const META_AD_ACCOUNT_ID = 'act_121782192994646'

async function testAfterPayment() {
    console.log('🧪 Testando acesso após pagamento resolvido...\n')

    try {
        console.log('📊 Tentando acessar conta: CA01 - Toca da Onça')
        console.log(`   ID: ${META_AD_ACCOUNT_ID}\n`)

        const response = await fetch(
            `https://graph.facebook.com/v18.0/${META_AD_ACCOUNT_ID}?fields=id,name,account_id,account_status,currency,amount_spent,balance,disable_reason&access_token=${META_ACCESS_TOKEN}`
        )
        const data = await response.json()

        if (data.error) {
            console.error('❌ Ainda sem acesso')
            console.error(`   Erro: ${data.error.message}`)
            console.error(`   Código: ${data.error.code}\n`)

            console.log('💡 Possíveis soluções:')
            console.log('   1. Adicionar "Carlos Andre" como ADMIN na conta')
            console.log('   2. Atribuir permissão "Gerenciar campanhas" completa')
            console.log('   3. Usar System User Token (mais profissional)\n')

            console.log('📷 Na imagem vejo que há 2 pessoas com acesso.')
            console.log('   Certifique-se de adicionar você (Carlos) com permissão ADMIN\n')

            return false
        }

        console.log('✅ SUCESSO! Conta acessível!\n')
        console.log('═══════════════════════════════════════════')
        console.log(`📊 ${data.name}`)
        console.log(`🆔 ID: ${data.account_id}`)
        console.log(`💼 Status: ${data.account_status}`)
        console.log(`💰 Moeda: ${data.currency}`)

        if (data.amount_spent) {
            const spent = (parseInt(data.amount_spent) / 100).toFixed(2)
            console.log(`💸 Total gasto: R$ ${spent}`)
        }

        if (data.balance) {
            const balance = (parseInt(data.balance) / 100).toFixed(2)
            console.log(`💵 Saldo: R$ ${balance}`)
        }

        if (data.disable_reason) {
            console.log(`⚠️ Motivo de suspensão: ${data.disable_reason}`)
        }

        console.log('═══════════════════════════════════════════\n')

        // Testar buscar campanhas
        console.log('🚀 Buscando campanhas...')
        const campaignsResponse = await fetch(
            `https://graph.facebook.com/v18.0/${META_AD_ACCOUNT_ID}/campaigns?fields=name,status,objective&limit=5&access_token=${META_ACCESS_TOKEN}`
        )
        const campaignsData = await campaignsResponse.json()

        if (campaignsData.error) {
            console.log(`   ⚠️ Erro ao buscar campanhas: ${campaignsData.error.message}\n`)
            return true // Conta acessível mas sem permissão de campanhas
        }

        const campaigns = campaignsData.data || []
        console.log(`   ✅ ${campaigns.length} campanha(s) encontrada(s)\n`)

        if (campaigns.length > 0) {
            campaigns.forEach((c, i) => {
                console.log(`   ${i + 1}. ${c.name} (${c.status})`)
            })
            console.log('')
        }

        console.log('🎉 TUDO FUNCIONANDO!')
        console.log('\n📝 Próximo passo:')
        console.log('   1. Adicionar token no .env.local')
        console.log('   2. Acessar: http://localhost:3000/admin/meta-dashboard\n')

        return true

    } catch (error) {
        console.error('❌ Erro:', error.message)
        return false
    }
}

testAfterPayment()
