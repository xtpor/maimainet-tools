
import fetch from "cross-fetch"

export default class Fetcher {
  userAgent = ""
  cookies = {}

  constructor(options) {
    this.userAgent = options.userAgent
    this.cookies = options.cookies || this.cookies
  }

  async get(url) {
    const response = await fetch(url, {
      headers: { "User-Agent": this.userAgent, ...formatCookie(this.cookies, url) },
      redirect: "manual",
    })
    this._updateCookies(response)

    console.log(`GET ${url} ${response.status}`)
    if (300 <= response.status && response.status <= 399) {
      return this.get(response.headers.get("location"))
    } else {
      return response
    }
  }

  async post(url, data = {}) {
    const body = String(new URLSearchParams(data))

    const response = await fetch(url, {
      method: "POST",
      body: body,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": this.userAgent,
        ...formatCookie(this.cookies, url),
      },
      redirect: "manual",
    })
    this._updateCookies(response)

    console.log(`POST ${url} ${response.status}`)
    if (300 <= response.status && response.status <= 399) {
      return this.get(response.headers.get("location"))
    } else {
      return response
    }
  }

  getCookie(site, key) {
    return this.cookies[site][key].value
  }

  _updateCookies(response) {
    this.cookies = mergeCookies(this.cookies, parseSetCookie(response))
  }

}

function formatCookie(cookies, url) {
  const now = Date.now()
  const { origin } = new URL(url)
  const entry = cookies[origin]
  if (entry) {
    return {
      cookie: Object.values(entry)
      .filter(cookie => {
        if (cookie.attributes.expires) {
          return Number(new Date(cookie.attributes.expires)) >= now
        } else {
          return true
        }
      })
      .map(cookie => `${cookie.key}=${cookie.value}`).join("; ")
    }
  } else {
    return {}
  }
}

function parseSetCookie(response) {
  let result = {}
  const { origin } = new URL(response.url)

  const headerValues = response.headers.raw()['set-cookie']
  if (Array.isArray(headerValues)) {
    for (const hv of headerValues ) {
      const cookie = parseCookieHeaderValue(hv)

      result[origin] = result[origin] || {}
      result[origin][cookie.key] = cookie
    }
  }

  return result
}

function parseCookieHeaderValue(headerValue) {
  const parts = headerValue.split(";").map(t => t.trim())
  const payload = parts[0]
  const [key, value] = payload.split("=")
  const attributes = Object.fromEntries(parts.slice(1).map(p => {
    const kv = p.split("=")
    if (kv.length > 1) {
      return [kv[0].toLowerCase(), kv[1]]
    } else {
      return [kv[0].toLowerCase(), true]
    }
  }))

  return { key, value, attributes }
}

function mergeCookies(ca, cb) {
  let result = {}

  for (const [origin, entries] of Object.entries(ca)) {
    for (const [key, value] of Object.entries(entries)) {
      result[origin] = result[origin] || {}
      result[origin][key] = value
    }
  }

  for (const [origin, entries] of Object.entries(cb)) {
    for (const [key, value] of Object.entries(entries)) {
      result[origin] = result[origin] || {}
      result[origin][key] = value
    }
  }

  return result
}
