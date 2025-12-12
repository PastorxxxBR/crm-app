// Teste simples da API do Mercado Livre
const testML = async () => {
    try {
        console.log('🔍 Testando API do Mercado Livre...')

        const url = 'https://api.mercadolibre.com/sites/MLB/search?q=roupas+feminina&limit=10'

        console.log('📡 URL:', url)

        const response = await fetch(url)

        console.log('📊 Status:', response.status)

        const data = await response.json()

        console.log('✅ Total de resultados:', data.results?.length || 0)

        if (data.results && data.results.length > 0) {
            console.log('\n🎯 Primeiro produto:')
            const first = data.results[0]
            console.log('- Título:', first.title)
            console.log('- Preço:', first.price)
            console.log('- Vendedor:', first.seller?.nickname)
            console.log('- Vendidos:', first.sold_quantity)
        }

        return data
    } catch (error) {
        console.error('❌ Erro:', error)
    }
}

testML()
