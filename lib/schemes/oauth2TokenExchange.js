import { get } from 'lodash'
import Oauth2Scheme from './oauth2'

export default class TokenExchangeScheme extends Oauth2Scheme {
  async _beforeRedirect (token) {
    const url = '/api/auth/social-auth'
    const data = await this.$auth.ctx.app.$axios.$post(url, {
      provider: this.name,
      token
    }).catch(async (e) => {
      await this.$auth.logout()
      // Ideally change this back to this.$auth.redirect('home', true) but trigger something in the store to raise a 'toast' or an exception
      const errorKey = get(e.response, 'data.error_description')
      // eslint-disable-next-line no-console
      console.error('Error during social-auth', errorKey, e)
      window.location.replace(
        this.$auth.options.redirect.login + `?error=${this.name}-no-account`
      )
    })
    this.$auth.setRefreshToken('local', data.refresh_token)
    this.$auth.setToken('local', 'Bearer ' + data.access_token)

    // logout of the oAuth2 scheme before switching to local
    this.$auth.logout()

    await this.$auth.setStrategy('local')
    await this.$auth.fetchUser()
  }
}
