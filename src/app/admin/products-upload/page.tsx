'use client'

import { useState } from 'react'
import { Upload, Download, Plus, FileText, Barcode, Package } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Product {
    name: string
    price: number
    stock: number
    barcode: string
    category: string
}

export default function ProductsUploadPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [newProduct, setNewProduct] = useState<Product>({
        name: '',
        price: 0,
        stock: 0,
        barcode: '',
        category: 'Roupas Femininas'
    })

    const categories = [
        'Roupas Femininas',
        'Roupas Masculinas',
        'Roupas Infantis',
        'Acessórios Femininos',
        'Acessórios Masculinos',
        'Calçados'
    ]

    // Upload CSV
    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            const lines = text.split('\n')
            const newProducts: Product[] = []

            // Pular header
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim()
                if (!line) continue

                const [name, price, stock, barcode, category] = line.split(',')

                newProducts.push({
                    name: name?.trim() || '',
                    price: parseFloat(price) || 0,
                    stock: parseInt(stock) || 0,
                    barcode: barcode?.trim() || '',
                    category: category?.trim() || 'Roupas Femininas'
                })
            }

            setProducts([...products, ...newProducts])
            toast.success(`${newProducts.length} produtos importados!`)
        }

        reader.readAsText(file)
    }

    // Adicionar produto manual
    const addProduct = () => {
        if (!newProduct.name || !newProduct.barcode) {
            toast.error('Preencha nome e código de barras!')
            return
        }

        setProducts([...products, newProduct])
        setNewProduct({
            name: '',
            price: 0,
            stock: 0,
            barcode: '',
            category: 'Roupas Femininas'
        })
        toast.success('Produto adicionado!')
    }

    // Download template CSV
    const downloadTemplate = () => {
        const template = `nome,preco,estoque,codigo_barras,categoria
Vestido Floral,89.90,10,7891234567890,Roupas Femininas
Calça Jeans,129.90,15,7891234567891,Roupas Femininas
Blusa Básica,49.90,20,7891234567892,Roupas Femininas`

        const blob = new Blob([template], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'template_produtos.csv'
        a.click()

        toast.success('Template baixado!')
    }

    // Salvar produtos
    const saveProducts = async () => {
        if (products.length === 0) {
            toast.error('Adicione produtos primeiro!')
            return
        }

        // TODO: Salvar no banco de dados
        toast.success(`${products.length} produtos salvos!`)
        console.log('Produtos:', products)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-6 h-6 text-green-600" />
                                Cadastro de Produtos
                            </h1>
                            <p className="text-sm text-gray-600">Adicione produtos manualmente ou importe via CSV</p>
                        </div>
                        <Link
                            href="/admin/pos"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Ir para PDV
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload CSV */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-green-600" />
                            Importar CSV
                        </h2>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-sm text-gray-600 mb-4">
                                    Arraste um arquivo CSV ou clique para selecionar
                                </p>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCSVUpload}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label
                                    htmlFor="csv-upload"
                                    className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-green-700"
                                >
                                    Selecionar Arquivo
                                </label>
                            </div>

                            <button
                                onClick={downloadTemplate}
                                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
                            >
                                <Download className="w-4 h-4" />
                                Baixar Template CSV
                            </button>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-2">Formato do CSV:</p>
                                <code className="text-xs text-blue-700">
                                    nome,preco,estoque,codigo_barras,categoria
                                </code>
                            </div>
                        </div>
                    </div>

                    {/* Cadastro Manual */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Cadastro Manual
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome do Produto *
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    placeholder="Ex: Vestido Floral"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preço (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                        placeholder="89.90"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estoque *
                                    </label>
                                    <input
                                        type="number"
                                        value={newProduct.stock}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                                        placeholder="10"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Barcode className="w-4 h-4" />
                                    Código de Barras *
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.barcode}
                                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                                    placeholder="7891234567890"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoria
                                </label>
                                <select
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={addProduct}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                            >
                                Adicionar Produto
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Produtos */}
                {products.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Produtos Adicionados ({products.length})
                            </h2>
                            <button
                                onClick={saveProducts}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                            >
                                Salvar Todos
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Preço</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estoque</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((product, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{product.name}</td>
                                            <td className="px-4 py-3 text-sm">R$ {product.price.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm">{product.stock}</td>
                                            <td className="px-4 py-3 text-sm font-mono">{product.barcode}</td>
                                            <td className="px-4 py-3 text-sm">{product.category}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
