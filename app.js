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
    return error('Borked request', err)
  }
}

function handler (req, res) {
  var body = ''
  var appjson = {'Content-Type': 'application/json'}
  var status = function(str) {return JSON.stringify({'status': str})}
  var params = qs.parse(req.url.replace(/^.*\?/, ''))
  var index = +params.index || 1
  var mode = params.mode || ""

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

    if(mode === 'daring') {

      find('nodes', {}, function(nodes) {
        find('edges', {}, function(edges) {
          res.end(JSON.stringify({V: nodes, E: edges}))
        })
      })

      return false
    }

    if(req.method === 'GET') {

      find('rmdata', {_id: index}, function(item) {
        res.end(JSON.stringify(item))
      })

      return false
    }

    var post = JSON.parse(body)

    if(!post) {
      error('Invalid request', post)
      res.writeHead(400, 'OK', appjson)
      res.end(status('Invalid POST request'))
      return false
    }

    if(post.method === 'addnode') {
      // change email address into user id
      // remove _id if there is one
      // add it
      var node = post.node
      email_to_user(post.email, function(user_id) {
        node.user = user_id
        delete node._id
        add('nodes', node, cb)
      })
    }

    if(post.method === 'addedge') {
      var node = post.node
      email_to_user(post.email, function(user_id) {
        node.user = user_id
        add('nodes', node, cb)
      })
    }

    if(post.method === 'editnode') {

    }

    if(post.method === 'editedge') {

    }

    if(post.method === 'removenode') {

    }

    if(post.method === 'removeedge') {

    }

    function cb() {}

    // function cb() {
    //   post['_id'] = 1
    //   edit_the_data_okay('rmdata', post)

    //   res.writeHead(200, 'OK', appjson)
    //   res.end()
    // }

    // add('rmhistory', post, cb)

  })
}

function email_to_user(email, cb) {
  find('users', {email: email}, function(row) { cb(row._id) })
}

function edit_the_data_okay(collection, item) {
  try {
    db.collection(collection, function(err, c) {

      c.save(item)

    })
  } catch (err) {
    error('Edit error', err)
  }
}

function find(collection, query, cb) {
  // log('find: ', collection, query)
  var result

  try {
    db.collection(collection, function(err, c) {

      c.find(query).toArray(function(err, items) {
        result = items.reduce(function(acc, value) {
          acc[value['_id']] = value
          return acc
        }, {})

        return cb(result)
      })

    })
  } catch (err) {
    error('Finding error', err)
    return cb(result)
  }
}

function add(collection, item, cb) {
  try {
    db.collection(collection, function(err, c) {

      if(!item || !Object.keys(item).length) {
        error('Invalid item found!!!', item)
        return cb()
      }

      c.save(item)

      return cb(item)
    })
  } catch (err) {
    error('Insertion error', err)
    return cb()
  }
}



function error() {
  log('ERROR!', arguments)
}

function log() {
  if(config.logit) {
    console.log(JSON.stringify([].slice.call(arguments), 0, 2))
  }
}

db.open(function(err, _db) {
  if(err)
    return error('DB refused to open', err)

  if(config.mongo.username) {
    db.authenticate(config.mongo.username, config.mongo.password, function(err, result) {
      app.listen(config.port)
    })
  } else {
    app.listen(config.port)
  }
})
