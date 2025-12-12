import { NextResponse } from 'next/server'
import { parseStringPromise } from 'xml2js'

/**
 * API para processar nota fiscal XML e extrair dados do pedido
 * POST /api/orders/import-nfe
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'Nenhum arquivo enviado' },
                { status: 400 }
            )
        }

        // Lê o conteúdo do arquivo XML
        const xmlContent = await file.text()

        // Parse XML para JSON
        const result = await parseStringPromise(xmlContent)

        // Extrai dados da NF-e
        const nfe = result.nfeProc?.NFe?.[0]?.infNFe?.[0]

        if (!nfe) {
            return NextResponse.json(
                { error: 'Formato de NF-e inválido' },
                { status: 400 }
            )
        }

        // Extrai dados do cliente (destinatário)
        const dest = nfe.dest?.[0]
        const customer = {
            name: dest.xNome?.[0] || '',
            cpf: dest.CPF?.[0] || dest.CNPJ?.[0] || '',
            email: dest.email?.[0] || '',
            phone: dest.fone?.[0] || '',
        }

        // Extrai endereço
        const enderDest = dest.enderDest?.[0]
        const address = {
            street: `${enderDest.xLgr?.[0]}, ${enderDest.nro?.[0]}`,
            complement: enderDest.xCpl?.[0] || '',
            neighborhood: enderDest.xBairro?.[0] || '',
            city: enderDest.xMun?.[0] || '',
            state: enderDest.UF?.[0] || '',
            cep: enderDest.CEP?.[0] || '',
        }

        // Extrai produtos
        const items = (nfe.det || []).map((det: any) => {
            const prod = det.prod?.[0]
            return {
                name: prod.xProd?.[0] || '',
                quantity: parseFloat(prod.qCom?.[0] || 0),
                price: parseFloat(prod.vUnCom?.[0] || 0),
                total: parseFloat(prod.vProd?.[0] || 0),
            }
        })

        // Extrai totais
        const total = nfe.total?.[0]?.ICMSTot?.[0]
        const values = {
            subtotal: parseFloat(total?.vProd?.[0] || 0),
            shipping: parseFloat(total?.vFrete?.[0] || 0),
            total: parseFloat(total?.vNF?.[0] || 0),
        }

        // Extrai informações do pedido
        const ide = nfe.ide?.[0]
        const orderInfo = {
            invoiceNumber: ide.nNF?.[0] || '',
            series: ide.serie?.[0] || '',
            date: ide.dhEmi?.[0] || new Date().toISOString(),
            key: nfe.$.Id?.replace('NFe', '') || '',
        }

        // Tenta identificar marketplace pelas informações adicionais
        const infAdic = nfe.infAdic?.[0]?.infCpl?.[0] || ''
        let marketplace = 'website'
        let marketplaceName = 'Site Próprio'

        if (infAdic.toLowerCase().includes('mercado livre') || infAdic.toLowerCase().includes('mercadolivre')) {
            marketplace = 'mercadolivre'
            marketplaceName = 'Mercado Livre'
        } else if (infAdic.toLowerCase().includes('shopee')) {
            marketplace = 'shopee'
            marketplaceName = 'Shopee'
        } else if (infAdic.toLowerCase().includes('amazon')) {
            marketplace = 'amazon'
            marketplaceName = 'Amazon'
        } else if (infAdic.toLowerCase().includes('magalu') || infAdic.toLowerCase().includes('magazine')) {
            marketplace = 'magalu'
            marketplaceName = 'Magazine Luiza'
        }

        // Monta objeto do pedido
        const order = {
            id: `#ORD-${orderInfo.invoiceNumber}`,
            customer,
            address,
            marketplace,
            marketplaceName,
            orderDate: orderInfo.date,
            status: 'Pago', // NF-e emitida = pedido pago
            paymentMethod: 'A identificar',
            items,
            ...values,
            invoiceKey: orderInfo.key,
            invoiceNumber: orderInfo.invoiceNumber,
        }

        return NextResponse.json({
            success: true,
            order,
            message: 'Nota fiscal importada com sucesso!',
        })
    } catch (error) {
        console.error('Erro ao processar NF-e:', error)
        return NextResponse.json(
            { error: 'Erro ao processar nota fiscal', details: String(error) },
            { status: 500 }
        )
    }
}
