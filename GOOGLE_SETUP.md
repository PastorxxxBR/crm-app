# Documentação - Configuração do Google Custom Search

## Para ativar busca em marketplaces:

### 1. Criar Custom Search Engine
1. Acesse: https://programmablesearchengine.google.com/
2. Clique em "Add" ou "Criar"
3. Configure:
   - **Sites to search**: 
     - `mercadolivre.com.br/*`
     - `shopee.com.br/*`
     - `amazon.com.br/*`
     - `magazineluiza.com.br/*`
   - **Name**: "Marketplace Fashion Scraper"
   - **Search the entire web**: OFF (apenas sites específicos)

4. Após criar, copie o **Search engine ID** (CX)
5. Cole no `.env.local`: `GOOGLE_CX=seu_id_aqui`

### 2. Ativar API no Google Cloud
1. Acesse: https://console.cloud.google.com/
2. Vá em "APIs & Services" > "Library"
3. Procure por "Custom Search API"
4. Clique em "Enable"
5. Vá em "Credentials" > "Create Credentials" > "API Key"
6. Copie a API Key
7. Cole no `.env.local`: `GOOGLE_API_KEY=sua_key_aqui`

### 3. Limites Gratuitos
- **100 buscas/dia** grátis
- Após isso: $5 por 1000 consultas

### 4. Alternativa (se não quiser usar Google API)
O sistema funciona com dados mock enquanto as APIs não estão configuradas.
Você pode testar tudo normalmente!

## Como testar as APIs:

```bash
# Buscar preços de um produto
curl http://localhost:3001/api/market/search?product=camiseta&marketplace=mercadolivre

# Comparar seus preços
curl http://localhost:3001/api/market/compare?marketplace=mercadolivre

# Análise por segmento
curl http://localhost:3001/api/market/segments?marketplace=mercadolivre
```
