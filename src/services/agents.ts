import { MarketingAgent } from '../agents/marketing'
import { IntegrationsAgent } from '../agents/integrations'
import { BIAgent } from '../agents/bi'
import { MarketplacesAgent } from '../agents/marketplaces'
import { SecurityAgent } from '../agents/security'
import { CustomerServiceAgent } from '../agents/customer-service'
import { InventoryAgent } from '../agents/inventory'
import { SocialMediaAgent } from '../agents/social'
import { CompetitiveAgent } from '../agents/competitive'
import { TrendingAgent } from '../agents/trending'
import { ContentAgent } from '../agents/content'
import { EmailMarketingAgent } from '../agents/email-marketing'
import { LoyaltyAgent } from '../agents/loyalty'

class AgentService {
    private static instance: AgentService

    public marketing: MarketingAgent
    public integrations: IntegrationsAgent
    public bi: BIAgent
    public marketplaces: MarketplacesAgent
    public security: SecurityAgent
    public customerService: CustomerServiceAgent
    public inventory: InventoryAgent
    public social: SocialMediaAgent
    public competitive: CompetitiveAgent
    public trending: TrendingAgent
    public content: ContentAgent
    public emailMarketing: EmailMarketingAgent
    public loyalty: LoyaltyAgent

    private constructor() {
        this.marketing = new MarketingAgent()
        this.integrations = new IntegrationsAgent()
        this.bi = new BIAgent()
        this.marketplaces = new MarketplacesAgent()
        this.security = new SecurityAgent()
        this.customerService = new CustomerServiceAgent()
        this.inventory = new InventoryAgent()
        this.social = new SocialMediaAgent()
        this.competitive = new CompetitiveAgent()
        this.trending = new TrendingAgent()
        this.content = new ContentAgent()
        this.emailMarketing = new EmailMarketingAgent()
        this.loyalty = new LoyaltyAgent()
    }

    public static getInstance(): AgentService {
        if (!AgentService.instance) {
            AgentService.instance = new AgentService()
        }
        return AgentService.instance
    }
}

export const agentService = AgentService.getInstance()
