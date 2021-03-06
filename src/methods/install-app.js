/**
 * @method
 * @memberof EcomApps
 * @name installApp
 * @description Install Market Apps into
 * [E-Com Plus Store REST API]{@link https://developers.e-com.plus/docs/api/#/store/applications/applications}.
 *
 * @param {number} appId - Market application ID
 * @param {boolean} [redirect=false] - Set to true when you
 * want to automatically redirect user on new window
 * when app returns a `redirect_uri` (usually for oauth flux)
 * @param {object} [appBody] - Market application body
 * @returns {Promise<{ app, result }|error>}
 *
 * @example

ecomApps.installApp(1236, true)
  .then(result => console.log(result))
  .catch(e => console.log(e))

 */

export default (self, appId, redirect = false, appBody) => {
  const { findApp, ecomAuth } = self
  const appProps = [
    'app_id',
    'title',
    'slug',
    'paid',
    'version',
    'version_date',
    'type',
    'load_events',
    'script_uri',
    'github_repository',
    'authentication',
    'auth_callback_uri',
    'auth_scope'
  ]

  const install = (app) => {
    const body = {}
    appProps.forEach(prop => {
      if (app[prop]) {
        body[prop] = app[prop]
      }
    })

    body.state = 'active'
    body.status = 'active'
    body.admin_settings = app.json_body || {}
    body.modules = app.module || {}
    body.version_date = new Date(app.version_date).toISOString()

    return ecomAuth
      .requestApi('/applications.json', 'post', body)
      .then(resp => {
        // redirect to oauth
        if (redirect && app.redirect_uri) {
          const auth = ecomAuth.getSession()
          const url = `${app.redirect_uri}?x_store_id=${auth.store_id}`
          createPopup(url, `Authentication ${app.title}`)
        }

        return {
          app,
          result: resp.data
        }
      })
  }

  if (appBody && appBody.app_id) {
    return install(appBody)
  } else {
    return findApp(appId).then(app => install(app))
  }
}

const createPopup = (url, title) => {
  if (typeof window !== 'object') {
    throw new Error('Method available for browser only')
  }

  // open new browser window
  const popup = window.open(url, title)
  if (popup) {
    if (typeof window === 'object' && window.focus) {
      popup.focus()
    }
  }
  return popup
}
