const express = require('express');
const ejs = require('ejs');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var request = require('request'); // "Request" library
var bodyParser = require('body-parser');

const app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(req, res) {
    res.render('login.ejs')
})


app.post('/autocomplete', function(req, res) {

    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200 && req.body.searchTerm != '') {

        var token = body.access_token;

        var options = {
          url: `https://api.spotify.com/v1/search?q=${req.body.searchTerm}&type=track`,
          headers: {
            'Authorization': 'Bearer ' + token
          },
          json: true
        };

        request(options, function(error, response, body) {

            var names = [];
            var preview_url = []
            var artists = []
            var albums = []


            for (i = 0; i < 5; i++) {
                if(body.tracks.items[i]){
                    names.push({name: body.tracks.items[i].name, artist: body.tracks.items[i].artists[0].name, uri: body.tracks.items[i].uri})

                }

            }
            res.status(200).json(names);
        });
      }
    });

})

app.get('/callback', function(req, res) {
    res.render('login.ejs')

});

app.get('/login', function(req, res) {
    res.render("login.ejs")

});


app.post('/login',function(req, res) {

    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var token = body.access_token;

        var options = {
          url: `https://api.spotify.com/v1/recommendations?limit=10&seed_tracks=${req.body.trackUri}&seed_genres=k-pop`,
          headers: {
            'Authorization': 'Bearer ' + token
          },
          json: true
        };

        request(options, function(error, response, body) {

            res.status(200).json(body);

        });
      }
    });
});

app.get('/create_playlist', function(req, res){
    res.render('createPlaylist.ejs');

})

app.get('/create_playlist/success', function(req, res){
    res.render('success.ejs');

})

//
app.post('/createPlaylist', function(req, res) {

    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var token = body.access_token;

        var options = {
          url: 'https://api.spotify.com/v1/users/' + userId + '/playlists',
          headers: {
            'Authorization': 'Bearer ' + token
          },
          json: true
        };

        request(options, function(error, response, body) {

            var names = [];
            var preview_url = []
            var artists = []
            var albums = []

            for (i = 0; i < body.tracks.length; i++) {
                names.push(body.tracks[i].name);
                preview_url.push(body.tracks[i].preview_url);
                artists.push(body.tracks[i].artists[0].name);
                albums.push(body.tracks[i].album.images[2].url)

            }

            res.status(200).json(body);

        });
      }
    });

})

const PORT = process.env.PORT

app.listen(PORT, () => console.log('Example app listening on port 3000!'))
