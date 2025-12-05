/**
 * @jest-environment jsdom
 */
import { GET } from '@/app/api/cron/process-campaigns/route'
import { createClient } from '@supabase/supabase-js'

// @ts-ignore
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn()
}))
// @ts-ignore
jest.mock('@/lib/evolution', () => ({
    evolution: { sendMessage: jest.fn() }
}))
// @ts-ignore
jest.mock('@/lib/mongodb', () => ({
    __esModule: true,
    default: Promise.resolve({ db: jest.fn() })
}))

describe('Campaign Engine Cron', () => {
    // @ts-ignore
    const mockSupabase = {
        // @ts-ignore
        from: jest.fn().mockReturnThis(),
        // @ts-ignore
        select: jest.fn().mockReturnThis(),
        // @ts-ignore
        eq: jest.fn().mockReturnThis(),
        // @ts-ignore
        lte: jest.fn().mockReturnThis(),
        // @ts-ignore
        limit: jest.fn().mockReturnThis(),
        // @ts-ignore
        update: jest.fn().mockReturnThis(),
        // @ts-ignore
        insert: jest.fn().mockReturnThis(),
    };

    // @ts-ignore
    (createClient as any).mockReturnValue(mockSupabase)

    // @ts-ignore
    beforeEach(() => {
        // @ts-ignore
        jest.clearAllMocks()
        process.env.CRON_SECRET = 'test-secret'
    })

    // @ts-ignore
    test('returns 401 if unauthorized', async () => {
        const req = new Request('http://localhost/api/cron', {
            headers: { authorization: 'Bearer wrong-secret' }
        })
        const res = await GET(req)
        // @ts-ignore
        expect(res.status).toBe(401)
    })

    // @ts-ignore
    test('processes scheduled campaigns', async () => {
        // 1. Mock Fetch Campaigns
        const mockCampaigns = [{ id: '1', name: 'Test Camp', message_template: 'Hi {{name}}', segment: {} }]
        // @ts-ignore
        mockSupabase.limit.mockResolvedValueOnce({ data: mockCampaigns, error: null })

        // 2. Mock Chain
        const queryBuilder = {
            // @ts-ignore
            eq: jest.fn().mockReturnThis(),
            // @ts-ignore
            lte: jest.fn().mockReturnThis(),
            // @ts-ignore
            limit: jest.fn().mockResolvedValue({ data: mockCampaigns, error: null }),
            then: (resolve: any) => resolve({ data: [{ id: 'c1', full_name: 'John', phone: '55119999' }], error: null })
        }
        // @ts-ignore
        mockSupabase.select.mockReturnValue(queryBuilder)

        const req = new Request('http://localhost/api/cron', {
            headers: { authorization: 'Bearer test-secret' }
        })

        const res = await GET(req)
        const json = await res.json()

        // @ts-ignore
        expect(res.status).toBe(200)
        // @ts-ignore
        expect(json.success).toBe(true)
        // @ts-ignore
        expect(mockSupabase.update).toHaveBeenCalledWith({ status: 'completed' })
    })
})
