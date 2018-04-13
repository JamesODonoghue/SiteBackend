let express = require('express')
let request = require('request')
let querystring = require('querystring')

let app = express()

var client_id = 'ceb9be711d7d46d8bdec35c613d38016'; // Your client id
var client_secret = '655b744453bb4c05867d29aba824a9f5'; // Your secret

let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8080/callback'

app.get('/login', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID || client_id,
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
        (process.env.SPOTIFY_CLIENT_ID || client_id) + ':' + (process.env.SPOTIFY_CLIENT_SECRET || client_secret)
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

app.use('/assets',express.static(__dirname + '/assets'));


let port = process.env.PORT || 8080
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)