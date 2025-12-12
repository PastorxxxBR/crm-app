// Teste com o novo token que tem permissões de Ads
const META_ACCESS_TOKEN = 'EAAT55cHV1XcBQNpuWBZAga6WGxNk0gyiPF5am2j8cdrVYdA8ByDJZAUQZAGaOsgqgEDea6knsxNEh228Oce0sZAbbJ5U6oqLYO6DlLdc63nDvmDbwyPaPxQBLtTPCdUABaYPFhLyaPtbY5Kt9wTGW3jRwteaZAr7GOXGCgW7ZBZBLLdd1dowkpSJBsojPgrQA6PPBZB74d9D8Rbpa4xwB0ENTW5ET3ZB5omP6WWGAZAOhnplKtWqZCs'
const META_AD_ACCOUNT_ID = 'act_121782192994664646'

async function testMetaAds() {
    console.log('🧪 Testando Facebook Ads API com novo token...\n')

    try {
        // 1. Validar token
        console.log('1️⃣ Validando token...')
        const meResponse = await fetch(
            `https://graph.facebook.com/v18.0/me?access_token=${META_ACCESS_TOKEN}`
        )
        const meData = await meResponse.json()

        if (meData.error) {
            console.error('❌ Erro:', meData.error.message)
            return
        }

        console.log('✅ Token válido!')
        console.log(`   Usuário: ${meData.name}\n`)

        // 2. Acessar conta de anúncios
        console.log('2️⃣ Acessando conta de anúncios...')
        const accountResponse = await fetch(
            `https://graph.facebook.com/v18.0/${META_AD_ACCOUNT_ID}?fields=name,account_status,currency,amount_spent,balance&access_token=${META_ACCESS_TOKEN}`
        )
        const accountData = await accountResponse.json()

        if (accountData.error) {
            console.error('❌ Erro:', accountData.error.message)
            return
        }

        console.log('✅ Conta acessível!')
        console.log(`   Nome: ${accountData.name}`)
        console.log(`   Status: ${accountData.account_status}`)
        console.log(`   Moeda: ${accountData.currency}\n`)

        // 3. Listar campanhas
        console.log('3️⃣ Listando campanhas...')
        const campaignsResponse = await fetch(
            `https://graph.facebook.com/v18.0/${META_AD_ACCOUNT_ID}/campaigns?fields=name,status,objective,daily_budget&limit=10&access_token=${META_ACCESS_TOKEN}`
        )
        const campaignsData = await campaignsResponse.json()

        if (campaignsData.error) {
            console.error('❌ Erro:', campaignsData.error.message)
            return
        }

        const campaigns = campaignsData.data || []
        console.log(`✅ ${campaigns.length} campanha(s) encontrada(s):\n`)

        campaigns.forEach((campaign, idx) => {
            console.log(`   📊 ${idx + 1}. ${campaign.name}`)
            console.log(`      • Status: ${campaign.status}`)
            console.log(`      • Objetivo: ${campaign.objective}`)
            if (campaign.daily_budget) {
                const budget = (parseInt(campaign.daily_budget) / 100).toFixed(2)
                console.log(`      • Orçamento: R$ ${budget}/dia`)
            }
            console.log('')
        })

        // 4. Buscar insights da conta
        console.log('4️⃣ Buscando insights (últimos 7 dias)...')
        const insightsResponse = await fetch(
            `https://graph.facebook.com/v18.0/${META_AD_ACCOUNT_ID}/insights?fields=impressions,clicks,spend,reach,ctr&date_preset=last_7d&access_token=${META_ACCESS_TOKEN}`
        )
        const insightsData = await insightsResponse.json()

        if (insightsData.error) {
            console.log('⚠️ Sem dados de insights (pode ser normal se não houver campanhas ativas)')
        } else {
            const insights = insightsData.data?.[0]
            if (insights) {
                console.log('✅ Insights dos últimos 7 dias:')
                console.log(`   💰 Investimento: R$ ${parseFloat(insights.spend || 0).toFixed(2)}`)
                console.log(`   👁️ Impressões: ${parseInt(insights.impressions || 0).toLocaleString()}`)
                console.log(`   👥 Alcance: ${parseInt(insights.reach || 0).toLocaleString()}`)
                console.log(`   🖱️ Cliques: ${parseInt(insights.clicks || 0)}`)
                console.log(`   📊 CTR: ${parseFloat(insights.ctr || 0).toFixed(2)}%\n`)
            } else {
                console.log('   Nenhum dado disponível (campanhas podem estar inativas)\n')
            }
        }

        console.log('═══════════════════════════════════════════')
        console.log('🎉 SUCESSO TOTAL! Facebook Ads integrado! 🎉')
        console.log('═══════════════════════════════════════════\n')
        console.log('📝 Próximos passos:')
        console.log('   1. Adicione o token no .env.local')
        console.log('   2. Reinicie o servidor (npm run dev)')
        console.log('   3. Acesse: http://localhost:3000/admin/meta-dashboard\n')

    } catch (error) {
        console.error('❌ Erro:', error.message)
    }
}

testMetaAds()
