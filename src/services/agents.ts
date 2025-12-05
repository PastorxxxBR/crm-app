import { MarketingAgent } from '../agents/marketing'
import { IntegrationsAgent } from '../agents/integrations'
import { BIAgent } from '../agents/bi'
import { MarketplacesAgent } from '../agents/marketplaces'
import { SecurityAgent } from '../agents/security'

class AgentService {
    private static instance: AgentService

    public marketing: MarketingAgent
    public integrations: IntegrationsAgent
    public bi: BIAgent
    public marketplaces: MarketplacesAgent
    public security: SecurityAgent

    private constructor() {
        this.marketing = new MarketingAgent()
        this.integrations = new IntegrationsAgent()
        this.bi = new BIAgent()
        this.marketplaces = new MarketplacesAgent()
        this.security = new SecurityAgent()
    }

    public static getInstance(): AgentService {
        if (!AgentService.instance) {
            AgentService.instance = new AgentService()
        }
        return AgentService.instance
    }
}

export const agentService = AgentService.getInstance()
