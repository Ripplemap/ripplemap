var config  = require('./config')
var app     = require('http').createServer(wrapper)
var qs      = require('querystring')
var mongo   = require('mongodb')
var request = require('request')

var db = new mongo.Db( config.mongo.db
                     , new mongo.Server( config.mongo.host
                                       , 27017
                                       , {auto_reconnect: true} )
                     , {w: 0} )        // TODO: change safety params!


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
  // var params = qs.parse(req.url.replace(/^.*\?/, ''))
  // var index = +params.index || 1
  // var mode = params.mode || ""

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

    if(req.method === 'GET') {

      // TODO: require the user to have logged in (probably via email link: examine token-based approach) [otherwise show public?]
      // TODO: limit facts by the user's org

      findlist('facts', {}, function(item) {
        res.end(JSON.stringify(item))
      })

      return false
    }

    var post = parse(body)

    if(!post) {
      reserr('Invalid POST request')
      return false
    }

    /*

    data model:
     user: id
     action: add/remove/edit
     type: node/edge
     tags: [...]
     [maybe other stats can live here?]
     data:
       node: {id, name, type, cat...}
       edge: {_in, _out, type, label}

     */

    if(['add', 'remove', 'edit'].indexOf(post.action) === -1)
      return reserr('Bad action')

    if(['node', 'edge'].indexOf(post.type) === -1)
      return reserr('Bad type')

    // TODO: check tags
    // TODO: check data
    // TODO: if it's an add:node, make sure the id doesn't conflict

    email_into_user(post.email, function(user) {
      if(!user)
        return reserr('Bad email address')

      // FIXME: Add new email addresses dynamically!

      var entry = { user: user._id
                  , type: post.type
                  , tags: post.tags
                  , data: post.data
                  , org:  user.org  // TODO: allow public data (org 0?) in addition to data from the user's org silo
                  , action: post.action
                  }

      add('facts', entry, cb)
    })

    return false

    function cb() {
      var new_id = Math.random() // FIXME: this is ridonk
      res.writeHead(200, 'OK', appjson)
      res.end(JSON.stringify({id: new_id}))
    }

    function reserr(str) {
      error(str, post)
      res.writeHead(400, 'OK', appjson)
      res.end(status('Invalid POST request'))
    }

  })
}

function parse(json) {
  try {
    return JSON.parse(json)
  } catch(e) {
    log('JSON parse error!', json)
    return []
  }
}

function email_into_user(email, cb) {
  findlist('users', {email: email}, function(rows) {
    if(rows.length) {
      // found an existing user
      userfun(rows[0])
    }
    else {
      // dynamically add new users
      var newuser = { email: email   // THINK: should we use numeric _ids to prevent date leaking?
                    , org: 1         // THINK: how do we find the right org?
                    }
      add('users', newuser, userfun)
    }

    function userfun(user) {
      cb(user)
    }
  })
}

function findlist(collection, query, cb) {
  var result

  try {
    db.collection(collection, function(err, c) {

      c.find(query).toArray(function(err, items) {
        result = items.reduce(function(acc, value) {
          acc.push(value)
          return acc
        }, [])

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
