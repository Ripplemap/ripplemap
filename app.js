var config  = require('./config')
var app     = require('http').createServer(wrapper)
var qs      = require('querystring')
var mongo   = require('mongodb')
var request = require('request')

var db = new mongo.Db( config.mongo.db
                     , new mongo.Server( config.mongo.host
                                       , 27017
                                       , {auto_reconnect: true} )
                     , {w: 0} )                             // TODO: change safety params!


function wrapper(req, res) {
  try {
    return handler(req, res)
  } catch(err) {
    return onError('Borked request', err)
  }
}

function handler (req, res) {
  var body = ''
  var appjson = {'Content-Type': 'application/json'}
  var status = function(str) {return JSON.stringify({'status': str})}

  log('req.url: ', req.url)

  req.on('data', function(chunk) {
    body += chunk
    if(body.length > 5E6) req.connection.destroy()          // 5MB-ish
  })

  req.on('end', function() {
    if(req.method == 'GET') {
      res.writeHead(200, 'OK', appjson)
      res.end(status('ok'))
      return false
    }

    var post = qs.parse(body)

    log('post', post)

    if(!post) {
      onError('Invalid request', post)
      res.writeHead(400, 'OK', appjson)
      res.end(status('Invalid POST request'))
      return false
    }


    var cb = function() {
      res.writeHead(302, {
        'Location': 'http://ripplemap.io/thank-you.html'
      })
      res.end()
    }

    add('amcform', post, cb)

  })
}



function add(collection, item, cb) {
  try {
    db.collection(collection, function(err, c) {

      if(!item || !Object.keys(item).length) {
        onError('Invalid item found!!!', item)
        return cb()
      }

      log('added: ', item)

      c.save(item)

      return cb(item)

    })
  } catch (err) {
    onError('Insertion error', err)
    return cb()
  }
}



function onError() {
  log('ERROR!', arguments)
}

function log() {
  if(config.logit) {
    console.log(JSON.stringify([].slice.call(arguments), 0, 2))
  }
}

db.open(function(err, db) {
  if(err)
    return onError('DB refused to open', err)

  if(config.mongo.username) {
    db.authenticate(config.mongo.username, config.mongo.password, function(err, result) {
      app.listen(config.port)
    })
  } else {
    app.listen(config.port)
  }
})
