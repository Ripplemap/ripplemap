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

    // if(mode === 'daring') {

    //   find('nodes', {}, function(nodes) {
    //     find('edges', {}, function(edges) {
    //       res.end(JSON.stringify({V: nodes, E: edges}))
    //     })
    //   })

    //   return false
    // }

    if(req.method === 'GET') {

      find('facts', {}, function(item) {
        res.end(JSON.stringify(item))
      })

      // find('nodes', {}, function(nodes) {
      //   find('edges', {}, function(edges) {
      //     res.end(JSON.stringify({V: nodes, E: edges}))
      //   })
      // })

      // find('rmdata', {_id: index}, function(item) {
      //   res.end(JSON.stringify(item))
      // })

      return false
    }

    var post = parse(body)

    log('yoyoyo', mode, post, body)


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

    email_into_id(post.email, function(user_id) {
      if(!user_id)
        return reserr('Bad email address')

      // FIXME: Add new email addresses dynamically!

      var entry = { user: user_id
                  , action: post.action
                  , type: post.type
                  , tags: post.tags
                  , data: post.data
                  }

      add('facts', entry, cb)
    })

    return false

    function cb() {
      var new_id = Math.random() // FIXME: this is ridonk
      res.writeHead(200, 'OK', appjson)
      res.end(JSON.stringify({id: new_id}))
    }

    function reserr(res, str) {
      error(res, post)
      res.writeHead(400, 'OK', appjson)
      res.end(status('Invalid POST request'))
    }

// laksdjflaskjdf;alsdjkfa;sldkfj



    // if(post.method === 'addnode') {
    //   // change email address into user id
    //   // remove _id if there is one
    //   // add it
    //   var node = post.data
    //   email_into_id(post.email, function(user_id) {
    //     node.user = user_id
    //     delete node._id
    //     delete node._in
    //     delete node._out
    //     add('nodes', node, cb)
    //   })
    // }

    // if(post.method === 'addedge') {
    //   var edge = post.data
    //   email_into_id(post.email, function(user_id) {
    //     edge.user = user_id
    //     add('edges', edge, cb)
    //   })
    // }

    // if(post.method === 'editnode') {

    // }

    // if(post.method === 'editedge') {

    // }

    // if(post.method === 'removenode') {

    // }

    // if(post.method === 'removeedge') {

    // }

    // function cb() {
    //   post['_id'] = 1
    //   edit_the_data_okay('rmdata', post)

    //   res.writeHead(200, 'OK', appjson)
    //   res.end()
    // }

    // add('rmhistory', post, cb)

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

function email_into_id(email, cb) {
  find('users', {email: email}, function(row) {
    cb(row._id)
  })
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
