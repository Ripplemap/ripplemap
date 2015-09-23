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

  // log('req.url: ', req.url)

  // yuck make this less horrible
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, CONNECT')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Max-Age', '86400') // 24 hours


  req.on('data', function(chunk) {
    body += chunk
    if(body.length > 5E6) req.connection.destroy()          // 5MB-ish
  })

  req.on('end', function() {
    if(req.method == 'GET') {
      // res.writeHead(200, 'OK', appjson)

      find('rmdata', {_id: 1}, function(item) {
        res.end(JSON.stringify(item))
      })

      return false
    }

    // var post = qs.parse(body)
    var post = JSON.parse(body)

    // log('post', post)

    if(!post) {
      onError('Invalid request', post)
      res.writeHead(400, 'OK', appjson)
      res.end(status('Invalid POST request'))
      return false
    }

    function cb() {
      post['_id'] = 1
      edit_the_data_okay('rmdata', post)

      res.writeHead(200, 'OK', appjson)
      res.end()
    }

    add('rmhistory', post, cb)

  })
}

function edit_the_data_okay(collection, item) {
  try {
    db.collection(collection, function(err, c) {

      c.save(item)

    })
  } catch (err) {
    onError('Edit error', err)
  }
}

function find(collection, query, cb) {
  // log('find: ', collection, query)
  var result

  try {
    db.collection(collection, function(err, c) {

      c.find(query).toArray(function(err, items) {
        // res.end(JSON.stringify(games[0]))

        // log('found: ', items)

        result = items.reduce(function(acc, value) {
          acc[value['_id']] = value
          value.userObjectID = value['_id']
          return acc
        }, {})

        return cb(result)
      })

    })
  } catch (err) {
    onError('Finding error', err)
    return cb(result)
  }
}

function add(collection, item, cb) {
  try {
    db.collection(collection, function(err, c) {

      if(!item || !Object.keys(item).length) {
        onError('Invalid item found!!!', item)
        return cb()
      }

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

db.open(function(err, _db) {
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
