// Validador de conformidade com Meta Ads Policies

export interface MetaPolicyCheck {
    isCompliant: boolean
    severity: 'error' | 'warning' | 'info'
    rule: string
    description: string
    fix?: string
}

export interface CampaignCompliance {
    overallCompliance: boolean
    score: number
    checks: MetaPolicyCheck[]
    canPublish: boolean
}

/**
 * Sistema de validação de conformidade com Meta Ads
 */
export class MetaComplianceValidator {
    /**
     * Valida campanha completa contra políticas da Meta
     */
    validateCampaign(campaign: {
        headline: string
        description: string
        images: string[]
        targetAudience: string
        budget: number
        objective: string
    }): CampaignCompliance {
        const checks: MetaPolicyCheck[] = []

        // 1. Valida textos
        checks.push(...this.validateText(campaign.headline, 'Título'))
        checks.push(...this.validateText(campaign.description, 'Descrição'))

        // 2. Valida imagens
        checks.push(...this.validateImages(campaign.images))

        // 3. Valida segmentação
        checks.push(...this.validateTargeting(campaign.targetAudience))

        // 4. Valida orçamento
        checks.push(...this.validateBudget(campaign.budget))

        // 5. Valida regras gerais Meta
        checks.push(...this.validateMetaGeneralRules(campaign))

        // Calcula score
        const errors = checks.filter(c => c.severity === 'error').length
        const warnings = checks.filter(c => c.severity === 'warning').length
        const totalChecks = 20 // Total de verificações
        const passedChecks = totalChecks - errors - (warnings * 0.5)
        const score = Math.round((passedChecks / totalChecks) * 100)

        return {
            overallCompliance: errors === 0,
            score,
            checks,
            canPublish: errors === 0 && score >= 80,
        }
    }

    private validateText(text: string, type: string): MetaPolicyCheck[] {
        const checks: MetaPolicyCheck[] = []

        // Regra 1: Texto com mais de 20% de MAIÚSCULAS
        const uppercaseRatio = (text.match(/[A-Z]/g) || []).length / text.length
        if (uppercaseRatio > 0.2) {
            checks.push({
                isCompliant: false,
                severity: 'error',
                rule: 'Excesso de Maiúsculas',
                description: `${type} tem ${Math.round(uppercaseRatio * 100)}% de letras maiúsculas. Meta permite máximo 20%.`,
                fix: 'Reduza o uso de MAIÚSCULAS no texto',
            })
        }

        // Regra 2: Palavras proibidas/sensíveis
        const forbiddenWords = ['grátis', 'free', '100%', 'garantido', 'milagre', 'melhor preço']
        const foundWords = forbiddenWords.filter(word =>
            text.toLowerCase().includes(word.toLowerCase())
        )

        if (foundWords.length > 0) {
            checks.push({
                isCompliant: false,
                severity: 'warning',
                rule: 'Palavras Sensíveis Detectadas',
                description: `Palavras que podem ser rejeitadas: ${foundWords.join(', ')}`,
                fix: 'Evite promessas absolutas e palavras sensacionalistas',
            })
        }

        // Regra 3: Comprimento do título (Max 40 caracteres para Meta)
        if (type === 'Título' && text.length > 40) {
            checks.push({
                isCompliant: false,
                severity: 'warning',
                rule: 'Título Muito Longo',
                description: `Título tem ${text.length} caracteres. Recomendado: máximo 40.`,
                fix: 'Encurte o título para melhor visualização',
            })
        }

        // Regra 4: Comprimento da descrição (Max 125 caracteres)
        if (type === 'Descrição' && text.length > 125) {
            checks.push({
                isCompliant: false,
                severity: 'warning',
                rule: 'Descrição Muito Longa',
                description: `Descrição tem ${text.length} caracteres. Recomendado: máximo 125.`,
                fix: 'Encurte a descrição para evitar cortes',
            })
        }

        return checks
    }

    private validateImages(images: string[]): MetaPolicyCheck[] {
        const checks: MetaPolicyCheck[] = []

        // Regra 5: Quantidade de imagens
        if (images.length === 0) {
            checks.push({
                isCompliant: false,
                severity: 'error',
                rule: 'Sem Imagens',
                description: 'Campanha precisa ter pelo menos 1 imagem',
                fix: 'Adicione pelo menos uma imagem criativa',
            })
        }

        // Regra 6: Meta recomenda mínimo 3 imagens para carrossel
        if (images.length > 0 && images.length < 3) {
            checks.push({
                isCompliant: true,
                severity: 'info',
                rule: 'Carrossel Incompleto',
                description: 'Para carrossel, Meta recomenda 3-10 imagens',
                fix: 'Adicione mais imagens para criar carrossel',
            })
        }

        // Regra 7: Máximo 10 cards no carrossel
        if (images.length > 10) {
            checks.push({
                isCompliant: false,
                severity: 'error',
                rule: 'Excesso de Imagens',
                description: 'Carrossel Meta permite máximo 10 cards',
                fix: 'Remova algumas imagens para ficar com 3-10',
            })
        }

        // Regra 8: Texto em imagem (máximo 20% da área)
        // Esta seria uma verificação com IA de visão computacional
        // Por enquanto, apenas aviso
        if (images.length > 0) {
            checks.push({
                isCompliant: true,
                severity: 'info',
                rule: 'Verificar Texto em Imagem',
                description: 'Certifique-se que texto ocupa menos de 20% da imagem',
                fix: 'Use ferramenta de verificação de texto Meta',
            })
        }

        return checks
    }

    private validateTargeting(audience: string): MetaPolicyCheck[] {
        const checks: MetaPolicyCheck[] = []

        // Regra 9: Segmentação discriminatória
        const discriminatoryTerms = ['idade', 'raça', 'religião', 'orientação sexual']
        const found = discriminatoryTerms.some(term =>
            audience.toLowerCase().includes(term)
        )

        if (found) {
            checks.push({
                isCompliant: false,
                severity: 'error',
                rule: 'Segmentação Discriminatória',
                description: 'Meta proíbe segmentação baseada em características protegidas',
                fix: 'Remova critérios discriminatórios da segmentação',
            })
        }

        return checks
    }

    private validateBudget(budget: number): MetaPolicyCheck[] {
        const checks: MetaPolicyCheck[] = []

        // Regra 10: Orçamento mínimo Meta Ads
        if (budget < 20) {
            checks.push({
                isCompliant: false,
                severity: 'error',
                rule: 'Orçamento Abaixo do Mínimo',
                description: 'Meta exige orçamento mínimo de R$ 20/dia',
                fix: 'Aumente o orçamento para pelo menos R$ 20',
            })
        }

        return checks
    }

    private validateMetaGeneralRules(campaign: any): MetaPolicyCheck[] {
        const checks: MetaPolicyCheck[] = []

        // Regra 11: Landing page funcional
        checks.push({
            isCompliant: true,
            severity: 'info',
            rule: 'Verificar Landing Page',
            description: 'Certifique-se que o link de destino está funcional e relevante',
            fix: 'Teste o link antes de publicar',
        })

        // Regra 12: Política de privacidade
        checks.push({
            isCompliant: true,
            severity: 'info',
            rule: 'Política de Privacidade',
            description: 'Se coletar dados, página deve ter política de privacidade',
            fix: 'Adicione link para política de privacidade',
        })

        return checks
    }

    /**
     * Gera relatório de compliance para exportação
     */
    generateComplianceReport(compliance: CampaignCompliance): string {
        let report = '=== RELATÓRIO DE CONFORMIDADE META ADS ===\n\n'
        report += `Score: ${compliance.score}/100\n`
        report += `Status: ${compliance.canPublish ? '✅ APROVADO' : '❌ REQUER CORREÇÕES'}\n\n`

        report += '--- PROBLEMAS ENCONTRADOS ---\n'
        const errors = compliance.checks.filter(c => c.severity === 'error')
        if (errors.length === 0) {
            report += 'Nenhum erro crítico encontrado!\n\n'
        } else {
            errors.forEach(e => {
                report += `❌ ${e.rule}: ${e.description}\n`
                report += `   Correção: ${e.fix}\n\n`
            })
        }

        report += '--- AVISOS ---\n'
        const warnings = compliance.checks.filter(c => c.severity === 'warning')
        warnings.forEach(w => {
            report += `⚠️ ${w.rule}: ${w.description}\n`
            report += `   Sugestão: ${w.fix}\n\n`
        })

        return report
    }
}

export const metaValidator = new MetaComplianceValidator()
