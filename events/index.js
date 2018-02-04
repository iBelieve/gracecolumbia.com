require('dotenv').config()

const url = require('url')
const fetch = require('node-fetch')
const querystring = require('querystring')

const PAGE_ID = 'grace.lutheran.columbia'

async function getEvents() {
  const query = querystring.stringify({
    time_filter: 'upcoming',
    access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`
  })
  const response = await fetch(`https://graph.facebook.com/v2.12/${PAGE_ID}/events?${query}`)
  const json = await response.json()

  return json.data
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')

  if (req.method === 'OPTIONS') {
    return
  }

  const { pathname, query } = url.parse(req.url)

  if (pathname === '/favicon.ico') {
    return send(res, 404, '')
  } else {
    return await getEvents()
  }
}
