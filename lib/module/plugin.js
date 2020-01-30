import Auth from './auth'

import './middleware'

// Active schemes
<%= options.uniqueSchemes.map(path =>`import ${'scheme_' + hash(path)} from '${path.replace(/\\/g,'/')}'`).join('\n') %>

export default function (ctx, inject) {
  // Options
  const options = <%= JSON.stringify(options.options) %>

  // Create a new Auth instance
  const $auth = new Auth(ctx, options)

  // Register strategies
  <%=
  options.strategies.map(strategy => {
    const scheme = 'scheme_' + hash(options.strategyScheme.get(strategy))
    const schemeOptions = JSON.stringify(strategy)

    const schemeOptionsFromEnv = Object.keys(strategy).reduce((agg, key) => {
      if (typeof strategy[key] !== 'string') return agg
      const match = strategy[key].match(/process.env.(.+)/)
      if (!match) return agg
      agg.push(`${key}: ctx.app.$env.${match[1]}`)
      return agg
    }, [])

    const name = strategy._name
    return `// ${name}\n  $auth.registerStrategy('${name}', new ${scheme}($auth, {
      ...${schemeOptions},
      ...{${schemeOptionsFromEnv.join(', ')}}
    }))`
  }).join('\n\n  ')
  %>

  // Inject it to nuxt context as $auth
  inject('auth', $auth)
  ctx.$auth = $auth

  // Initialize auth
  return $auth.init().catch(error => {
    if (process.client) {
      console.error('[ERROR] [AUTH]', error)
    }
  })
}
