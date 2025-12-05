import { evolution } from '@/lib/evolution'
import axios from 'axios'

// Mock axios with factory to ensure 'create' returns the mock instance at import time
jest.mock('axios', () => {
    const mockAxios = {
        create: jest.fn(() => mockAxios),
        post: jest.fn(),
        get: jest.fn()
    }
    return mockAxios
})

describe('Evolution API Wrapper', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { })
        jest.spyOn(console, 'warn').mockImplementation(() => { })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    test('sendMessage calls API with correct parameters', async () => {
        (mockedAxios.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } })

        const phone = '5511999999999'
        const text = 'Hello Test'

        await evolution.sendMessage(phone, text)

        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/message/sendText/default',
            expect.objectContaining({
                number: phone,
                textMessage: { text }
            })
        )
    })

    test('sendMessage throws error if API fails', async () => {
        (mockedAxios.post as jest.Mock).mockRejectedValueOnce(new Error('API Down'))

        await expect(evolution.sendMessage('123', 'fail')).rejects.toThrow('API Down')
    })
})
