// Descobrir quais contas de anúncios estão acessíveis
const META_ACCESS_TOKEN = 'EAAT55cHV1XcBQNpuWBZAga6WGxNk0gyiPF5am2j8cdrVYdA8ByDJZAUQZAGaOsgqgEDea6knsxNEh228Oce0sZAbbJ5U6oqLYO6DlLdc63nDvmDbwyPaPxQBLtTPCdUABaYPFhLyaPtbY5Kt9wTGW3jRwteaZAr7GOXGCgW7ZBZBLLdd1dowkpSJBsojPgrQA6PPBZB74d9D8Rbpa4xwB0ENTW5ET3ZB5omP6WWGAZAOhnplKtWqZCs'

async function findAdAccounts() {
    console.log('🔍 Buscando contas de anúncios acessíveis...\n')

    try {
        // Buscar ID do usuário
        const meResponse = await fetch(
            `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${META_ACCESS_TOKEN}`
        )
        const meData = await meResponse.json()
        console.log(`👤 Usuário: ${meData.name}`)
        console.log(`🆔 User ID: ${meData.id}\n`)

        // Buscar contas de anúncios que o usuário tem acesso
        console.log('📊 Buscando contas de anúncios...\n')

        const accountsResponse = await fetch(
            `https://graph.facebook.com/v18.0/${meData.id}/adaccounts?fields=id,name,account_id,account_status,currency,amount_spent,balance&access_token=${META_ACCESS_TOKEN}`
        )
        const accountsData = await accountsResponse.json()

        if (accountsData.error) {
            console.error('❌ Erro:', accountsData.error.message)
            console.log('\n⚠️ O usuário pode não ter contas de anúncios ou precisa de permissão admin\n')

            // Tentar buscar via business manager
            console.log('🏢 Tentando buscar via Business Manager...\n')
            const businessesResponse = await fetch(
                `https://graph.facebook.com/v18.0/${meData.id}/businesses?fields=id,name&access_token=${META_ACCESS_TOKEN}`
            )
            const businessesData = await businessesResponse.json()

            if (businessesData.data && businessesData.data.length > 0) {
                console.log(`✅ ${businessesData.data.length} Business Manager(s) encontrado(s):\n`)

                for (const business of businessesData.data) {
                    console.log(`📂 ${business.name} (ID: ${business.id})`)

                    // Buscar contas de anúncios do business
                    const bizAdAccountsResponse = await fetch(
                        `https://graph.facebook.com/v18.0/${business.id}/adaccount?fields=id,name,account_status&access_token=${META_ACCESS_TOKEN}`
                    )
                    const bizAdAccountsData = await bizAdAccountsResponse.json()

                    if (bizAdAccountsData.data && bizAdAccountsData.data.length > 0) {
                        bizAdAccountsData.data.forEach(account => {
                            console.log(`   📊 ${account.name}`)
                            console.log(`       ID: ${account.id}`)
                            console.log(`       Status: ${account.account_status}\n`)
                        })
                    }
                }
            } else {
                console.log('❌ Nenhum Business Manager encontrado\n')
            }

            return
        }

        const accounts = accountsData.data || []

        if (accounts.length === 0) {
            console.log('⚠️ Nenhuma conta de anúncios encontrada')
            console.log('\nPossíveis razões:')
            console.log('1. O usuário não tem contas de anúncios criadas')
            console.log('2. Falta permissão "Ads Management Standard Access"')
            console.log('3. O app precisa ser aprovado pela Meta\n')
            return
        }

        console.log(`✅ ${accounts.length} conta(s) encontrada(s):\n`)
        console.log('═══════════════════════════════════════════\n')

        accounts.forEach((account, idx) => {
            console.log(`${idx + 1}. ${account.name}`)
            console.log(`   📍 ID Completo: ${account.id}`)
            console.log(`   🔢 Account ID: ${account.account_id}`)
            console.log(`   💼 Status: ${account.account_status}`)
            console.log(`   💰 Moeda: ${account.currency}`)
            if (account.amount_spent) {
                console.log(`   💸 Total gasto: R$ ${(parseInt(account.amount_spent) / 100).toFixed(2)}`)
            }
            console.log('')
        })

        console.log('═══════════════════════════════════════════')
        console.log('\n📝 Use um destes IDs no .env.local:')
        accounts.forEach((account, idx) => {
            console.log(`   Opção ${idx + 1}: META_AD_ACCOUNT_ID=${account.id}`)
        })
        console.log('')

    } catch (error) {
        console.error('❌ Erro:', error.message)
    }
}

findAdAccounts()
