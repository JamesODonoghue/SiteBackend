let express = require('express')
let request = require('request')
let querystring = require('querystring')
let path = require('path')

require('dotenv').config();


let app = express()

let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8080/callback'

app.get('/login', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID || process.env.CLIENT_ID,
      scope: 'user-read-private user-read-email user-top-read',
      redirect_uri
    }))
})

app.get('/logout', function(req, res) {
  res.redirect('https://accounts.spotify.com/logout')
})

app.get('/callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        (process.env.SPOTIFY_CLIENT_ID || process.env.CLIENT_ID) + ':' + (process.env.SPOTIFY_CLIENT_SECRET || process.env.CLIENT_SECRET)
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    let uri = (process.env.FRONTEND_URI || 'http://localhost:3000') + '/spotify/'
    res.redirect(uri + '?access_token=' + access_token)
  })
})

// app.use(express.static('assets'));

app.use('/assets',express.static(path.join(__dirname + '/assets')));


let port = process.env.PORT || 8080
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)