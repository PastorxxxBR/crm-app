
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN

// Helper to check if Facebook is configured
export const isFacebookConfigured = () => !!FACEBOOK_ACCESS_TOKEN

export const facebookService = {
  async getMe() {
    if (!FACEBOOK_ACCESS_TOKEN) {
      throw new Error('⚠️ FACEBOOK_ACCESS_TOKEN is not configured. Please set it in your environment variables.')
    }
    // Fields: id, name
    const response = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${FACEBOOK_ACCESS_TOKEN}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Facebook API Error: ${JSON.stringify(error)}`)
    }
    return response.json()
  },

  async getAccounts() {
    if (!FACEBOOK_ACCESS_TOKEN) {
      throw new Error('⚠️ FACEBOOK_ACCESS_TOKEN is not configured. Please set it in your environment variables.')
    }
    // Get pages the user manages
    const response = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${FACEBOOK_ACCESS_TOKEN}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Facebook API Error: ${JSON.stringify(error)}`)
    }
    return response.json()
  }
}

