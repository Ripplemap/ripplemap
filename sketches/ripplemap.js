/*global Dagoba */

// HELPERS

function noop() {}

function not(fun) {return function() {return !fun.apply(null, arguments)}}

function eq(attr, val) {return function(obj) {return obj[attr] === val}}

function unique(v, k, list) {return list.indexOf(v) === k}

function strip(attr) {return function(obj) { delete obj[attr]; return obj }}

function comp(f, g) {return function() { var args = [].slice.call(arguments); return f(g.apply(null, args)) }}

function prop (attr) {return function(obj) {return obj[attr]}}

function cp_prop(from_attr, to_attr) {return function(obj) {obj[to_attr] = obj[from_attr]; return obj}}

function clone(obj) {return JSON.parse(JSON.stringify(obj))}

function truncate(str, to) {
  if(!to || str.length <= to) return str
  return str.substr(0, to-2) + '...'
}

function push_it(list, key, val) {
  if(!list[key])
    return list[key] = [val]

  list[key].push(val)
  return list[key]
}

function pipe() {
  var all_funs = [].slice.call(arguments)

  function magic_pipe(data) {
    var funs = all_funs.slice()
    var fun

    function inner() {
      while(fun = funs.shift()) {
        if(fun.async) {              // fun is async
          return fun.async(data, cb)
        } else {                     // fun is a function
          data = fun(data)
        }
      }
    }

    function cb(new_data) {
      data = new_data
      inner()
    }

    // TODO: this should return a promise for data
    inner()
    return true
  }

  return magic_pipe
}

function error(mess) {
  console.log(arguments, mess)
}

var el = document.getElementById.bind(document)
var qs = document.querySelectorAll.bind(document)


// THE BEGINNING

var RM = {}

RM.el_gobutton = el('addaction')
RM.el_sentences = el('sentences')
RM.el_newaction = el('newaction')
RM.el_conversation = el('the-conversation')

RM.ctx = el('ripples').getContext('2d')
RM.pipelines = []
RM.conversation = new_conversation()


/* INTERFACES FOR RIPPLE MODEL
 *
 * There are four categories: Thing, Action, Effect, and Happening
 *
 * Each category has multiple types associated with it. Each node has a category and type.
 *
 * Each node also tracks its cron, the adding user, and some type of 'confidence interval' (later)
 *
 * Each edge has a type, which is its label. Nodes expect edges of certain types.
 *
 */

RM.cats = {} // ripplemap categories
RM.cats.thing = {}
RM.cats.action = {}
RM.cats.effect = {}
RM.cats.happening = {}

function get_node(catstr, typestr, props) {
  var node = convert_props(props)

  var cat = RM.cats[catstr]
  if(!cat)
    return error('that is not a valid cat', catstr)

  var type = cat[typestr]
  if(!type)
    return error('that is not a valid ' + catstr + ' type', typestr)

  // TODO: check props again the cattype's property list

  node.cat  = catstr
  node.type = typestr
  node.name = props.name || typestr // TODO: remove (or something...)

  return node
}

function add_alias(catstr, typestr, alias) {
  // TODO: check alias

  // add an alias to anything
  var cat = RM.cats[catstr]
  if(!cat)
    return error('Invalid cat', catstr)

  var type = cat[typestr]
  if(!type)
    return error('That is not a valid thing type', typestr)

  // add alias
  type.aliases.push(alias)

  // add type to list
  cat[alias] = type

  // THINK: alias rules?
}


function add_thing(type, props, persist) {
  var node = get_node('thing', type, props)
  if(!node) return false

  node.priority = 1 // bbq???

  add_to_graph('node', node)
  if(persist)
    add_to_server_facts('node', node)

  return node
}

function add_action(type, props, persist) {
  var node = get_node('action', type, props)
  if(!node) return false

  node.priority = 1 // bbq???

  // TODO: check props against type (what does this mean?)

  add_to_graph('node', node)
  if(persist)
    add_to_server_facts('node', node)

  return node
}

function add_effect(type, props, persist) {
  var node = get_node('effect', type, props)
  if(!node) return false

  node.priority = 0.5 // bbq???

  add_to_graph('node', node)
  if(persist)
    add_to_server_facts('node', node)
}

function add_happening(type, props, persist) {
  var node = get_node('happening', type, props)
  if(!node) return false

  node.priority = 0.4

  add_to_graph('node', node)
  if(persist)
    add_to_server_facts('node', node)
}



function new_thing_type(type, properties) {
  // TODO: valid type?

  // does this type exist already?
  var cattype = RM.cats.thing[type]
  if(cattype)
    return error('That thing type already exists', type)

  // manually create
  // THINK: should we copy properties here?
  cattype = {type: type}
  cattype.aliases = [] // THINK: but if you do don't override properties.aliases

  // add properties.cc
  cattype.cc = properties.cc || {}

  // add default props for all things
  cattype.props = {} // THINK: get props from properties.props?
  cattype.props.name = {}
  cattype.props.start = {} // THINK: these have both fuzziness and confidence issues (how sure is the user of the time, how sure are we of the user)
  cattype.props.end = {}

  // TODO: add questions

  // put in place
  RM.cats.thing[type] = cattype

  // add properties.aliases
  if(properties.aliases) {
    properties.aliases.forEach(function(alias) {
      add_alias('thing', type, alias)
    })
  }
}

function new_action_type(type, properties) {
  // TODO: valid type?

  // does this type exist already?
  var cattype = RM.cats.action[type]
  if(cattype)
    return error('That action type already exists', type)

  // manually create
  // THINK: should we copy properties here?
  cattype = {type: type}

  // add properties.edges and default edges
  cattype.edges = properties.edges || {}
  cattype.edges.did = {dir: 'in',  plural: 0, label: 'did', types: ['person'], aliases: []}
  cattype.edges.to  = {dir: 'in',  plural: 0, label: 'to',  types: ['effect'], aliases: []}
  cattype.edges.the = {dir: 'out', plural: 0, label: 'the', types: ['thing'],  aliases: []}

  // add default props for all actions
  cattype.props = {} // THINK: get props from properties.props?
  cattype.aliases = [] // THINK: but if you do don't override properties.aliases

  // TODO: add questions

  // put in place
  RM.cats.action[type] = cattype

  // add properties.aliases
  if(properties.aliases) {
    properties.aliases.forEach(function(alias) {
      add_alias('action', type, alias)
    })
  }
}

function new_effect_type(type, properties) {
  // TODO: valid type?

  // does this type exist already?
  var cattype = RM.cats.effect[type]
  if(cattype)
    return error('That effect type already exists', type)

  // manually create
  // THINK: should we copy properties here?
  cattype = {type: type}

  // add properties.edges and default edges
  cattype.edges = properties.edges || {}
  cattype.edges.to     = {dir: 'out', plural: 0, label: 'to',     types: ['action'],    aliases: []}
  cattype.edges.by     = {dir: 'in',  plural: 1, label: 'by',     types: ['thing'],     aliases: []}
  cattype.edges.was    = {dir: 'in',  plural: 1, label: 'was',    types: ['person'],    aliases: []}
  cattype.edges.during = {dir: 'out', plural: 0, label: 'during', types: ['happening'], aliases: []}

  // add default props for all effects
  cattype.props = {} // THINK: get props from properties.props?
  cattype.aliases = [] // THINK: but if you do don't override properties.aliases

  // TODO: add questions

  // put in place
  RM.cats.effect[type] = cattype

  // add properties.aliases
  if(properties.aliases) {
    properties.aliases.forEach(function(alias) {
      add_alias('effect', type, alias)
    })
  }
}

function new_happening_type(type, properties) {
  // what properties do happenings have?
  // an edge type can have an alias for storytelling purposes

  // TODO: valid type?

  // does this type exist already?
  var cattype = RM.cats.happening[type]
  if(cattype)
    return error('That happening type already exists', type)

  // manually create
  // THINK: should we copy properties here?
  cattype = {type: type}

  // add properties.edges and default edges
  cattype.edges = properties.edges || {}
  cattype.edges.at     = {dir: 'out', plural: 0, label: 'at',     types: ['place',   'event'], aliases: []}
  cattype.edges.the    = {dir: 'out', plural: 1, label: 'the',    types: ['outcome', 'event'], aliases: []}
  cattype.edges.did    = {dir: 'in',  plural: 1, label: 'did',    types: ['person'],           aliases: []}
  cattype.edges.during = {dir: 'in',  plural: 0, label: 'during', types: ['effect'],           aliases: []}

  // add default props for all happenings
  cattype.props = {} // THINK: get props from properties.props?
  cattype.aliases = [] // THINK: but if you do don't override properties.aliases

  // TODO: add questions

  // put in place
  RM.cats.happening[type] = cattype

  // add properties.aliases
  if(properties.aliases) {
    properties.aliases.forEach(function(alias) {
      add_alias('happening', type, alias)
    })
  }
}


function new_edge_type(type, properties) {
  // what properties do edges have?
}

function add_edge(type, from, to, props, persist) {
  var edge = {}

  // check from and to
  // check type against from and to interfaces
  // publish in dagoba + persist

  edge = convert_props(props)
  edge._in = to
  edge._out = from
  edge.type = type
  edge.label = type

  add_to_graph('edge', edge)
  if(persist)
    add_to_server_facts('edge', edge)
}

function import_graph(V, E) {
  // add V things
  // add V happenings
  // add edges
}

function extract_story(V, E) {
  // given a subgraph, extract a "story"
}

function reset_graph() {
  RM.G = Dagoba.graph()
}

function story_to_text(story) {
  // what is a story?
  // how do we turn it into text?
}

function subgraph_of(thing1, thing2) {
  // find all the paths between them, and their attached bits
}


// SET UP CATEGORIES AND EDGES

new_thing_type('person',  {})
new_thing_type('org',     {cc: ['org']})
new_thing_type('place',   {cc: ['place', 'event']})
new_thing_type('event',   {cc: ['event', 'outcome'], timerange: true}) // already has start and end, so... ?
new_thing_type('outcome', {cc: ['outcome'], aliases: ['artwork', 'session']}) // local vs ubiquitous outcomes -- they're structurally different

new_action_type('pass',      {aliases: []})
new_action_type('join',      {aliases: []})
new_action_type('leave',     {aliases: []})
new_action_type('create',    {aliases: []})
new_action_type('attend',    {aliases: ['participate in']})
new_action_type('manage',    {aliases: ['run', 'lead', 'facilitate', 'coordinate', 'organize']})
new_action_type('assist',    {aliases: ['help', 'host', 'contribute']})
new_action_type('present',   {aliases: []})
new_action_type('represent', {aliases: []})
new_action_type('fund',      {aliases: []})

new_effect_type('inspire',   {aliases: ['influenced']})
new_effect_type('convince',  {aliases: ['ask']})
new_effect_type('introduce', {aliases: ['meet']})

new_happening_type('conversation', {aliases: []})
new_happening_type('experience',   {aliases: ['see', 'hear', 'watch', 'attend']})


// next steps: write out all the connections between words
// institute real edge conditions
// get it out the other end
// stick it into the input





// MODEL HELPERS

var email = 'bz@dann.bz' // TODO: fix this
var loading = true // TODO: fix this
var tags = ['net_neutrality'] // FIXME: fix this

function add_to_server_facts(type, live_item) {
  if(loading)
    return false

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

  // var item = JSON.parse(JSON.stringify(live_item))
  var item = Object.keys(live_item).reduce(function(acc, key) {
        if(['_in', '_out'].indexOf(key) !== -1) return acc
        acc[key] = live_item[key]
        return acc
      }, {})

  if(type === 'edge') {
    item._out = live_item._out._id
    item._in  = live_item._in._id
  }

  // FIXME: limit display to particular tags
  // FIXME: allow dynamic email addresses
  // FIXME: present splash page of some kind
  // FIXME: add the 'inspire' action


  var fact = { email: email
             , action: 'add'
             , type: type
             , tags: tags
             , data: item
             }

  send_data_to_server(fact)

  // if(type === 'node') {
  //   var node = { name: item.name
  //              , cat: item.cat
  //              , type: item.type
  //              }
  //   send_data_to_server('addnode', item, email, function(id) {
  //     item._id = id // FIXME: is this wise???
  //   })
  // }

  // if(type === 'edge') {
  //   send_data_to_server('addedge', item, email, function(item) {
  //     // THINK: erm what?
  //   })
  // }
}

function add_to_graph(type, item) {
  if(type === 'node') {
    // TODO: this is kind of a hack, but also kind of not
    if(!item._id)
      item._id = get_new_id()
    RM.G.addVertex(item)
  }

  if(type === 'edge') {
    RM.G.addEdge(item)
  }
}

function get_new_id() {
  // TODO: swap this out for maybe a mongo_id implementation
  return "" + Math.random()
}

function persist() {
  // TODO: persist itemized changes

  // localstorage
  Dagoba.persist(RM.G, 'rripplemap')

  // hit the server
  // send_data_to_server_no_questions_asked_okay()
}

persist = debounce(persist, 1000)

function debounce(func, wait, immediate) {
  // via underscore, needs cleaning
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.

  var timeout
  return function() {
    var context = this, args = arguments
    var later = function() {
          timeout = null
          if (!immediate) func.apply(context, args)
        }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

function send_data_to_server(data, cb) {
  var url = 'http://ripplemap.io:8888'

  if(safe_mode === 'daring') {
    url = 'http://localhost:8888'
  }
  else if(safe_mode) {
    return console.log(RM.G)
  }

  // var json = Dagoba.jsonify(RM.G)
  // var packet = { method: method
  //              , email: email
  //              , data: data
  //              }

  fetch(url, { method: 'post'
             , body: JSON.stringify(data)
  }).then(function(response) {
    return response.json()
  }).then(function(result) {
    // now you have the id or something
    // FIXME: make mongo-like ids automatically for each new node
    if(cb)
      cb(result)
  })
}

function get_data_from_server_no_questions_asked_okay(cb) {
  var url = 'http://ripplemap.io:8888'

  // local shunt for airplane mode
  if(safe_mode === 'local')
    return cb(JSON.parse(localStorage['DAGOBA::ripmapdata']))

  if(safe_mode === 'daring') {
    url = 'http://localhost:8888'
  }
  else {
    var index = +safe_mode || 1
    url += "?index=" + index
    // var u = new URLSearchParams()
    // u.append('index', index)
  }

  fetch(url, {
    method: 'get'
  }).then(function(response) {
    return response.json()
  }).then(function(data) {
    cb(data)
    // if(safe_mode !== 'daring' && data[index])
    //   cb(data[index])
    // else {
    //   // unpack data
    //   var v = Object.keys(data.V).map(function(id) { return data.V[id] })
    //   var e = Object.keys(data.E).map(function(id) { return data.E[id] })
    //   cb({V: v, E: e})
    // }
  }).catch(function(err) {
    console.log('lalalal', err)
  })
}

function convert_props(props) {
  if(typeof props !== 'object')
    return {}

  if(Array.isArray(props))
    return {}

  return clone(props)
}



// INTERACTIONS

document.addEventListener('keydown', function(ev) {
  // TODO: clean this up (prevent span hijacking)
  if( ev.target.tagName === 'SPAN'
   || ev.target.tagName === 'INPUT'
   || ev.target.tagName === 'SELECT'
   || ev.target.tagName === 'TEXTAREA'
    )
    return true

  var key = ev.keyCode || ev.which

  // var key_a = 97
  var key_e = 69
  var key_f = 70
  var key_l = 76
  // var key_n = 110
  // var key_p = 112
  // var key_s = 115
  var tilde = 126
  var larro = 37
  var rarro = 39
  // var langl = 60
  // var rangl = 62

  if(key === larro) {
    if(current_year <= my_minyear) return false
    current_year--
    render()
    ev.preventDefault()
  }

  if(key === rarro) {
    if(current_year >= my_maxyear) return false
    current_year++
    render()
    ev.preventDefault()
  }

  if(key === key_f) {
    filter_sentences = !filter_sentences
    render()
  }

  if(key === key_e) {
    all_edges = !all_edges
    render()
  }

  // if(key === key_a) {
  //   all_edges = true
  //   render()
  // }

  // if(key === key_s) {
  //   all_edges = false
  //   render()
  // }

  if(key === key_l) {
    show_labels = !show_labels
    render()
  }

  if(key === tilde) {
    admin_mode = !admin_mode
    render()
  }
})

RM.el_sentences.addEventListener('keyup', function(ev) {
  var key = ev.keyCode || ev.which
  var span = ev.target
  var id = span.id
  var type = span.classList.contains('edge') ? 'edge' : 'cat'
  var val = span.textContent
  var id = span.getAttribute('data-id')

  // TODO: trap return for special effects
  // TODO: maybe trap tab also

  // ev.preventDefault()

  // handle the node case
  if(type === 'cat' && id && val) {
    var node = RM.G.vertexIndex[id]
    if(node && node.name !== val) {
      // update the name/label in the real graph
      node.name = val
      pub(id)
    }
  }

  // handle the edge case
  if(type === 'edge') {
    var id1 = span.getAttribute('data-id1')
    var id2 = span.getAttribute('data-id2')

    var node1 = RM.G.vertexIndex[id1]
    var edges = node1._in.concat(node1._out)
    var edge = edges.filter
      (function(edge)
        {return ( edge._in._id == id1 && edge._out._id == id2 )
             || ( edge._in._id == id2 && edge._out._id == id1 ) })[0]

    if(!edge) return false

    edge.label = val
    edge.type = val

    // pub(id1 + '-' + id2)
    // Dagoba.persist(G, 'rripplemap')
    persist()
  }

  function pub(id) {
    // publish the change
    // Dagoba.persist(G, 'rripplemap')
    persist()

    // update all other sentences
    var spans = qs('span.node-' + id)
    for(var i = 0; i < spans.length; i++) {
      if(spans[i] !== span)
        spans[i].textContent = val
    }

    // rerender the graph
    render(0)
  }

})

RM.el_sentences.addEventListener('click', function(ev) {
  var target = ev.target
  if(target.nodeName !== 'BUTTON')
    return true

  var id = target.getAttribute('data-id')
  var node = RM.G.vertexIndex[id]

  if(!node)
    return error('That node does not exist')

  if(node.cat === 'action') { // remove "sentence"
    RM.G.removeVertex(node)
  }
  else {
    RM.G.removeVertex(node) // THINK: is this really reasonable?
  }

  persist()
  render()
})

RM.el_gobutton.addEventListener('click', function(ev) {
  var thing1name = el('thing1name').value
  var thing1type = el('thing1type').value
  var thing2name = el('thing2name').value
  var thing2type = el('thing2type').value

  var actiontype = el('actiontype').value
  var actiondate = el('actiondate').value

  // check for thing1
  var thing1 = RM.G.v({name: thing1name, type: thing1type}).run()[0]
  if(!thing1) {
    thing1 = add_thing(thing1type, {name: thing1name}, true)
  }

  var thing2 = RM.G.v({name: thing2name, type: thing2type}).run()[0]
  if(!thing2) {
    thing2 = add_thing(thing2type, {name: thing2name}, true)
  }

  var action = add_action(actiontype, {time: new Date(actiondate).getTime() })

  // did everything go okay?
  if(!thing1 || !thing2 || !action)
    return false

  RM.el_newaction.reset()

  add_edge('the', action._id, thing2._id, 0, true)
  add_edge('did', thing1._id, action._id, 0, true)

  render()
})

RM.el_conversation.addEventListener('submit', function(ev) {
  ev.preventDefault()

  whatsnext(RM.graph, join_conversation(RM.conversation))

  return false
})


// RENDER PIPELINE

// TODO: fix these globals

var safe_mode        = false // okay whatever
var all_edges        = false // awkward... :(
var admin_mode       = false // yep another hack w00t
var my_maxyear       = 2016  // total hackery...
var my_minyear       = 2008  // hack hack hack
var show_labels      = false // yup
var current_year     = 2009  // more hacks
var filter_sentences = true  // awkward... :(
var ring_radius      = 45    // lalala

function build_pipelines() {
  // TODO: consider a workflow for managing this tripartite pipeline, so we can auto-cache etc
  RM.pipelines[0] = pipe( mod('data', sg_compact)
                          // layout:
                        , set_year
                        , data_to_graph
                        , add_fakes
                        , set_coords
                        , set_score
                        , minimize_edge_length
                        , remove_fakes
                        , unique_y_pos
                        , filter_by_year
                          // shapes:
                        , add_rings
                        , add_ring_labels
                        , copy_edges
                        , copy_nodes
                        , add_node_labels
                        , add_edge_labels
                          // rendering:
                        , clear_it
                        , draw_it
                        , draw_metadata
                        )

  RM.pipelines[1] = pipe( get_actions
                        , filter_actions
                        , make_sentences
                        , write_sentences
                        )
}

function render(n) {
  // TODO: cloning is inefficient: make lazy subgraphs
  var env = {data: Dagoba.clone(RM.G), params: {my_maxyear: my_maxyear, my_minyear: my_minyear}, shapes: [], ctx: RM.ctx}

  if(n === undefined)
    RM.pipelines.forEach(function(pipeline) { pipeline(env) })
  else
    RM.pipelines[n](env)
}



// COMPACTIONS

function sg_compact(graph) {
  // so... this is pretty silly i guess or something
  // var g = Dagoba.graph(graph.V, graph.E)
  var g = graph
  var vertex_ids = g.v().property('_id').run()
  var newg = Dagoba.graph()
  var edges = []

  vertex_ids.forEach(function(id) {
    var node = g.v(id).run()[0]
    if(node.time)
      return false

    var others = g.v(id).both().run()
    others.forEach(function(other) {
      if(other.time)
        node.time = Math.min(node.time||Infinity, other.time)

      var oo = g.v(other._id).both().run()
      if(oo.length < 2)
        return false

      var edge = {_in: oo[0]._id, _out: oo[1]._id, label: other.name || ""}
      edges.push(edge)
      newg.addVertex(node)
    })
  })

  edges.forEach(function(edge) {
    newg.addEdge(edge)
  })

  return JSON.parse(Dagoba.jsonify(newg))
}


// LAYOUT

function wrap(env, prop) {
  return function(data) {
    var foo = clone(env)
    foo[prop] = data
    return foo
  }
}

function mod(prop, fun) {
  return function(env) {
    env[prop] = fun(env[prop])
    return env
  }
}

function set_year(env) {
  var minyear = Infinity
  var maxyear = 0
  var list = env.params.years = {}

  env.data.V = env.data.V.map(function(node) {

    if(node.time < 1199161600000) return node // HACK: remove me!!!

    var year = (new Date(node.time+100000000)).getFullYear()
    if(year < minyear) minyear = year // effectful :(
    if(year > maxyear) maxyear = year // effectful :(

    node.year = year // mutation :(
    push_it(list, node.year, node) //, G.vertexIndex[node._id])

    return node
  })

  // env.params.minyear = minyear
  // env.params.maxyear = maxyear
  env.params.minyear = my_minyear
  env.params.maxyear = my_maxyear

  return env
}

function data_to_graph(env) {
  // THINK: this is kind of weird... we could probably get more leverage by just using G itself
  env.params.graph = Dagoba.graph(env.data.V, env.data.E)
  env.data.V = env.params.graph.vertices
  env.data.E = env.params.graph.edges
  return env
}

function add_fakes(env) {
  var years = env.params.years

  Object.keys(years).forEach(function(yearstr) {
    var year = years[yearstr]
    var fake = {type: 'fake', year: yearstr, name: 'fake', _in: [], _out: []}
    // var copies = 3 + Math.ceil(year.length / 5)
    var copies = 10 - year.length < 0 ? 2 : 10 - year.length
    // var fakes = [clone(fake), clone(fake), clone(fake), clone(fake), clone(fake), clone(fake), clone(fake), clone(fake)]
    var fakes = []
    for(var i = 0; i < copies; i++) {
      fakes.push(clone(fake))
    }

    Array.prototype.push.apply(year, fakes)
    Array.prototype.push.apply(env.data.V, fakes)
  })

  return env
}

function set_coords(env) {
  var years = env.params.years

  env.data.V.forEach(function(node) {
    if(node.x) return node

    var offset = node.year - env.params.my_minyear + 1
    var radius = offset * ring_radius // HACK: remove this!

    var nabes = years[node.year]
    // var gnode = G.vertexIndex[node._id]

    if(!nabes) return false

    var index = nabes.indexOf(node)
    var arc = 2 * Math.PI / nabes.length

    var deg = offset + index * arc
    var cx  = radius * Math.cos(deg)
    var cy  = radius * Math.sin(deg)
    var edge_count = node._in.length + node._out.length

    node.shape = 'circle'
    node.x = cx
    node.y = cy
    node.r = 4 + 2*Math.min(5, edge_count / 2) //Math.floor(node.name.charCodeAt(0)/20)

    return node
  })

  return env
}

function set_score(env) {
  env.data.V = env.data.V.map(function(node) { node.score = score(node); return node })
  return env
}

function minimize_edge_length(env) {
  var years = env.params.years

  Object.keys(years).sort().forEach(function(key) {
    var peers = years[key]
    peers.sort(score_sort)
    peers.forEach(function(node) {
      peers.forEach(function(peer) {
        swap(node, peer)
        var new_node_score = score(node)
        var new_peer_score = score(peer)
        if(node.score + peer.score < new_node_score + new_peer_score) {
          swap(node, peer)
        } else {
          node.score = new_node_score
          peer.score = new_peer_score
        }
      })
    })
  })

  return env

  function swap(n1, n2) {
    var x = n1.x, y = n1.y
    n1.x = n2.x; n1.y = n2.y
    n2.x = x;    n2.y = y
  }

  function score_sort(n1, n2) {
    return n1.score - n2.score
  }
}

function score(node) {
  return [].concat(node._in||[], node._out||[]).reduce(function(acc, edge) {return acc + score_edge(edge, node)}, 0)

  function score_edge(edge, self) {
    //// TODO: if other end is "older" than this end, don't count it...
    if(edge._in  === node && edge._out.year > node.year) return 0
    if(edge._out === node && edge._in. year > node.year) return 0

    // return edge._in.x + edge._out.x

    var dx = Math.abs(edge._in.x - edge._out.x)
    var dy = Math.abs(edge._in.y - edge._out.y)

    return Math.sqrt(dx*dx + dy*dy)
  }
}

function remove_fakes(env) {
  env.data.V = env.data.V.filter(function(node) {
    return node.type !== 'fake'
  })
  return env
}

function unique_y_pos(env) {
  var threshold = 6
  // var node_radius = 5
  var arc = Math.PI / 100
  var years = env.params.years
  var ys = []

  Object.keys(years).sort().forEach(function(key) {
    var peers = years[key]
    peers.forEach(function(node) {
      var coords, closest

      if(node.type === 'fake') // le sigh
        return

      // A) do a binary search on an array of midpoints to find the closest one
      // B) if it's within threshold walk around the circle in both directions until you find an opening
      // C) if you reach the antipode give up

      for(var da = arc; da < Math.PI; da = -1*(da + arc*(da/Math.abs(da)))) {
        coords = modify_coords(node, da)
        closest = find_closest(coords.y, ys)
        if(!closest || Math.abs(closest - coords.y) > threshold)
          break
      }

      // console.log(da, closest, coords.y, Math.abs(closest - coords.y))

      node.x = coords.x
      node.y = coords.y
      ys.push(coords.y)

      ys.sort(function(a,b) {return a - b}) // OPT: just insert coords.y in place

    })
  })

  gys = ys // TODO: remove this smelly global that was put here for debugging
  return env

  function modify_coords(node, da) {
    return { x: node.x * Math.cos(da) - node.y * Math.sin(da)
           , y: node.x * Math.sin(da) + node.y * Math.cos(da)
           }
  }

  function find_closest(n, ns) { // binary search
    var closest
    var index = Math.floor(ns.length / 2)
    var item = ns[index]

    if(ns.length < 5) {
      for(var i = 0; i < ns.length; i++) {
        if(closest === undefined || Math.abs(ns[i] - n) < Math.abs(closest - n))
          closest = ns[i]
      }
      return closest
    }

    if(item === n)
      return item

    if(item > n)
      return find_closest(n, ns.slice(0, index))

    return find_closest(n, ns.slice(index + 1))
  }
}

function filter_by_year(env) {
  var max = env.params.my_maxyear
  var min = env.params.my_minyear

  // hack hack hack
  if(current_year < max)
    max = current_year

  // TODO: do this in Dagoba so we can erase edges automatically
  env.data.V = env.data.V.filter(function(node) {
    // yuckyuckyuck
    if(node.year > max || node.year < min) {
      env.params.graph.removeVertex(node)
      return false
    }
    return true
  })
  return env
}


// SHAPES

function add_rings(env) {
  for(var i = env.params.minyear; i <= env.params.maxyear; i++) {
    var color = i === current_year ? '#999' : '#ccc'
    var radius = ring_radius * (i - env.params.my_minyear + 1)
    env.shapes.unshift({shape: 'circle', x: 0, y: 0, r: radius, stroke: color, fill: 'white', line: 1, type: 'ring', year: i})
  }
  return env
}

function add_ring_labels(env) {
  var labels = []

  env.shapes.filter(eq('type', 'ring')).forEach(function(shape) {
    var fill = shape.year === current_year ? '#999' : '#ccc'
    var label = {shape: 'text', str: shape.year, x: -15, y: -shape.r - 5, fill: fill, font: "18px Raleway" }
    labels.push(label)
  })

  env.shapes = env.shapes.concat(labels)
  return env
}

function copy_edges(env) {
  env.data.E.forEach(function(edge) {
    if(!all_edges && !(edge._out.year === current_year || edge._in.year === current_year)) // HACK: remove this
      return false

    var label = edge.label || "777"
    var color = str_to_color(label)

    // function str_to_color(str) { return 'hsl' + (show_labels?'a':'') + '(' + str_to_num(str) + ',100%,40%' + (show_labels?',0.3':'') + ')';}
    function str_to_color(str) { return 'hsla' + '(' + str_to_num(str) + ',30%,40%,0.' + (show_labels?'3':'7') + ')' }
    function str_to_num(str) { return char_to_num(str, 0) + char_to_num(str, 1) + char_to_num(str, 2) }
    function char_to_num(char, index) { return (char.charCodeAt(index) % 20) * 20 }

    var line = {shape: 'line', x1: edge._in.x, y1: edge._in.y, x2: edge._out.x, y2: edge._out.y, stroke: color, type: 'edge', label: label}
    env.shapes.push(line)
  })
  return env
}

function copy_nodes(env) {
  env.shapes = env.shapes.concat(env.data.V.map(function(node) {
    // HACK: move this elsewhere
    if(!all_edges) {
      var ghost = !node._in.concat(node._out)
                       .map(e => [e._in.year, e._out.year])
                       .reduce((acc, t) => acc.concat(t), [])
                       .filter(y => y === current_year).length
      if(ghost)
        return []
    }

    // var this_year = all_edges || node.year === current_year
    // var color =  'hsla(0,0%,20%,0.' + (this_year ? '99' : '3') + ')'

    // Person: Blue
    // Org: Green
    // Event: Magenta
    // Outcome: Orange
    // Concept: Purple
    // Labels should be black
    // Connections should be grey
    var hues = { outcome: '40'
               // , action '20'
               , person: '240'
               , event: '320'
               , org: '100'
               }

    var color = 'hsla(' + hues[node.type] + ',80%,50%,0.99)'

    var shape = { shape: 'circle'
                , x: node.x
                , y: node.y
                , r: node.r
                , name: node.name
                , fill: color
                }
    return shape
  }))
  return env
}

function add_node_labels(env) {
  var labels = []

  env.shapes.forEach(function(shape) {
    if(!shape.name) return false
    var str = truncate(shape.name, 50)
    var label = {shape: 'text', str: str, x: shape.x + 15, y: shape.y + 5}
    labels.push(label)
  })

  env.shapes = env.shapes.concat(labels)
  return env
}

function add_edge_labels(env) {
  if(!show_labels)
    return env

  var labels = []

  env.shapes.forEach(function(shape) {
    if(shape.type !== 'edge') return false
    var label = {shape: 'angle_text', x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2, fill: shape.stroke, str: shape.label}
    labels.push(label)
  })

  env.shapes = env.shapes.concat(labels)
  return env
}

// RENDERING

function clear_it(env) {
  env.ctx.clearRect(0, 0, 1000, 1000)
  return env
}

function draw_it(env) {
  env.shapes.forEach(function(node) {
    draw_shape(env.ctx, node)
  })
  return env
}

function draw_metadata(env) {
  // el('minyear').textContent = 1900 + env.params.minyear
  // el('maxyear').textContent = 1900 + current_year
  return env
}


// CANVAS FUNCTIONS

function draw_shape(ctx, node) {
  var cx = 450
  var cy = 450

  if(node.shape === 'circle')
    draw_circle(ctx, cx + node.x, cy + node.y, node.r, node.stroke, node.fill, node.line)

  if(node.shape === 'line')
    draw_line(ctx, cx + node.x1, cy + node.y1, cx + node.x2, cy + node.y2, node.stroke, node.line)

  if(node.shape === 'text')
    draw_text(ctx, cx + node.x, cy + node.y, node.str, node.font, node.fill)

  if(node.shape === 'angle_text')
    draw_angle_text(ctx, cx + node.x1, cy + node.y1, cx + node.x2, cy + node.y2, node.str, node.font, node.fill)
}

function draw_circle(ctx, x, y, radius, stroke_color, fill_color, line_width) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI*2, false)
  ctx.fillStyle = fill_color || '#444444'
  ctx.fill()
  ctx.lineWidth = line_width || 2
  ctx.strokeStyle = stroke_color || '#eef'
  ctx.stroke()
}

function draw_line(ctx, fromx, fromy, tox, toy, stroke_color, line_width) {
  var path=new Path2D()
  path.moveTo(fromx, fromy)
  path.lineTo(tox, toy)
  ctx.strokeStyle = stroke_color || '#eef'
  ctx.lineWidth = line_width || 0.5
  ctx.stroke(path)
}

function draw_text(ctx, x, y, str, font, fill_color) {
  ctx.fillStyle = fill_color || '#000'
  ctx.font = font || "14px Raleway"
  if(isNaN(x)) return false
  x = x || 0
  y = y || 0
  ctx.fillText(str, x, y)
}

function draw_angle_text(ctx, x1, y1, x2, y2, str, font, fill_color) {
  ctx.fillStyle = fill_color || '337'
  ctx.font = font || "14px sans-serif"

  // modified from http://phrogz.net/tmp/canvas_rotated_text.html

  var padding = 5
  var dx = x2 - x1
  var dy = y2 - y1
  var len = Math.sqrt(dx*dx+dy*dy)
  var avail = len - 2*padding
  var pad = 1/2
  var x = x1
  var y = y1

  var textToDraw = str
  if (ctx.measureText && ctx.measureText(textToDraw).width > avail){
    while (textToDraw && ctx.measureText(textToDraw+"…").width > avail) textToDraw = textToDraw.slice(0, -1)
    textToDraw += "…"
  }

  // Keep text upright
  var angle = Math.atan2(dy, dx)
  if (angle < -Math.PI/2 || angle > Math.PI/2){
    x = x2
    y = y2
    dx *= -1
    dy *= -1
    angle -= Math.PI
  }

  ctx.save()
  ctx.textAlign = 'center'
  ctx.translate(x+dx*pad, y+dy*pad)
  ctx.rotate(angle)
  ctx.fillText(textToDraw, 0, -3)
  ctx.restore()
}



// SENTENCE STRUCTURES

function get_actions(env) {
  var actions = RM.G.v({cat: 'action'}).run() // FIXME: use env.data, not G
  env.params.actions = actions
  return env
}

function filter_actions(env) {
  if(!filter_sentences) return env
  env.params.actions = env.params.actions.map(function(action) {
    action.year = new Date(action.time+100000000).getFullYear()
    return action
  })
  .filter(function(action) {
    return action.year === current_year
  })

  return env
}


function make_sentences(env) {
  var sentences = env.params.actions.map(construct).filter(Boolean)
  env.params.sentences = sentences
  return env
}

function construct(action) {
  var list = []
  var edges = action._out.concat(action._in)
  if(!edges[1]) return false
  if(edges[0].label === 'the')
    edges = [edges[1], edges[0]]
  function notme(id, edge) { return edge._in._id === id ? edge._out : edge._in }
  list.push(notme(action._id, edges[0]), edges[0], action, edges[1], notme(action._id, edges[1]))
  list.year = action.year
  return list
}

function write_sentences(env) {
  RM.el_sentences.innerHTML = ''
  var oldyear = 1

  env.params.sentences.sort(function(a, b) {
    return a.year - b.year
  })

  env.params.sentences.forEach(function(list) {
    var sentence = ''

    if(list.year !== oldyear) {
      sentence = '<h2>' + list.year + '</h2>'
      oldyear = list.year
    }

    sentence += '<p>'
    list.forEach(function(thing) {
      var data
      var word = thing.name || thing.label
      var cat = thing.cat
      var type = cat ? thing.type : 'edge'

      var classes = [type]
      if(cat) {
        classes.push(cat)
        classes.push('node-' + thing._id)
      }
      else {
        classes.push('node-' +  thing._in._id + '-' + thing._out._id)
      }

      if(type !== 'edge')
        data = {id: thing._id||''}
      else
        data = {id1: thing._in._id, id2: thing._out._id}

      if(!admin_mode)
        sentence += template(classes, data, word)
      else
        sentence += admin_template(thing, type, cat, word)
    })
    sentence += '.</p>'

    RM.el_sentences.innerHTML += sentence
  })

  function template(classes, data, text) {
    classes.unshift('word')
    var classtext = classes.join(' ')

    var datatext = Object.keys(data).map(function(key) {return 'data-' + key + '="' + data[key] + '"'}).join(' ')

    return ' <span class="' + classtext + '"'
         + datatext
         + ' contentEditable="true">'
         + text + '</span>'
  }

  function admin_template(thing, type, cat, text) {
    var button = ''
    var notes = ''

    if(cat === 'action') {
      button = '<button class="delete" data-id="'+thing._id+'">delete just this sentence</button>'
    }
    else if(type !== 'edge') {
      notes = ' (' + type + ')'
      button = '<button class="delete" data-id="'+thing._id+'">delete this thing and all its sentences entirely</button>'
    }

    return ' ' + text + notes + button
  }

  return env
}




// FORM BUILDER & FRIENDS

function whatsnext(graph, conversation) {
  // TODO: incorporate graph knowledge (graph is the whole world, or the relevant subgraph)
  // THINK: what is a conversation?
  // are we currently in a sentence? then find the highest weighted unfilled 'port'
  //

  render_conversation(conversation)
}

function get_cat_dat(cat, q) {
  var substrRegex = new RegExp(q, 'i')
  var frontRegex = new RegExp('^' + q, 'i')
  var nodes = RM.G.vertices.filter(function(node) {return node.cat === cat}).map(prop('name'))
        .filter(function(name) {return substrRegex.test(name)})

  nodes.sort(function(a, b) {
    return frontRegex.test(b) - frontRegex.test(a) || a.charCodeAt() - b.charCodeAt()
  })

  return nodes
}

function get_thing_by_name(name) {
  return RM.G.vertices.filter(function(node) {return node.name === name}) || {}
}

function render_conversation(conversation) {
  var typeahead_params = {hint: true, highlight: true, minLength: 1}
  function typeahead_source(cat) {return {name: 'states', source: function(q, cb) {cb(get_cat_dat(cat, q))}}}

  var inputs = ''
  var prelude = ''
  var submit_button = '<input type="submit" style="position: absolute; left: -9999px">'

  // special case the first step
  var sentence = conversation.current

  sentence.filled.forEach(function(slot, i) {
    // display the filled slot
    prelude += inject_value(slot, slot.value, i) + ' '
    // if(slot.type === 'word') {
    //   prelude += inject_value(slot, slot.value) + ' '
    // }
    // else if(slot.type === 'gettype') {
    //   prelude += ' (which is a '
    //   prelude += slot.value
    //   prelude += ') '
    // }
  })

  // display the unfilled slot
  var slot = sentence.slots[0]
  var input = ''
  if(slot.type === 'word') {
    input = inject_value(slot, make_word_input(slot.cat, slot.key))
  }
  else if(slot.type === 'gettype') {
    input = inject_value(slot, make_type_input(slot.cat, slot.key))
  }
  else if(slot.type === 'date') {
    input = inject_value(slot, make_date_input(slot.key))
  }

  prelude += input


  // do the DOM
  RM.el_conversation.innerHTML = prelude + inputs + submit_button

  // wiring... /sigh
  var catnames = Object.keys(RM.cats)
  catnames.forEach(function(cat) {
    $('.'+cat+'-input').typeahead(typeahead_params, typeahead_source(cat))
  })

  if(sentence.filled.length)
    $('#' + slot.key).focus()

  return false

  // helper functions

  function make_word_input(cat, key) {
    var text = ''

    if(cat === 'thing')
      return '<input class="typeahead ' +cat+ '-input" type="text" placeholder="A' +mayben(cat)+ ' ' +cat+ '" id="' +key+ '">'
    if(cat === 'action') {
      text += '<select id="verb" name="verb">'
      var options = ['participate in', 'lead', 'fund', 'organize']
      // var options = ['facilitate', 'coordinate', 'contribute', 'create', 'attend', 'manage', 'assist', 'present', 'join', 'leave']
      options.forEach(function(option) {
        text += '<option>' + option + '</option>'
      })
      text += '</select>'
      return text
    }
  }

  function make_type_input(cat, key) {
    // TODO: this assumes cat is always 'thing'
    var str = '<select id="'+key+'">'
    str += '<option value="person">person</option>'
    str += '<option value="org">org</option>'
    str += '<option value="event">event</option>'
    str += '<option value="outcome">outcome</option>'
    str += '</select>'
    return str
  }

  function make_date_input(key) {
    var str = '<input id="' +key+ '" type="date" name="' +key+ '" value="2010-01-01" />'
    return str
  }

  function inject_value(slot, value, index) { // HACK: index is a huge hack, remove it.
    var text = ''

    if(slot.key === 'subject') {
      if(slot.value) {
        text += '<p><b>' + slot.value + '</b></p>'
      } else {
        text += "Okay, let's fill in the blanks. Tell us about "
        text += value + ' '
      }
    }
    else if(slot.key === 'verb') {
      text += ' did '
      text += value
      text += ' the '
    }
    else if(slot.key === 'object') {
      text += value + ' '
    }
    else if(slot.type === 'gettype') {
      if(index === 1) {
        text += ' is a'
        text += mayben(value) + ' '
        text += value + ' '
        if(slot.value)
          text += slot.value === 'person' ? 'who ' : 'which '
      } else {
        text += ' (a'
        text += mayben(value) + ' '
        text += value + ') '
      }
    }
    else if(slot.type === 'date') {
      text += ' in/on '
      text += value + ' '
    }
    else {
      text = ' ' + value + ' '
    }

    return text
  }
}

function mayben(val) {
  return /^[aeiou]/.test(val) ? 'n' : ''
}

function join_conversation(conversation) {
  var wants = conversation.current.slots[0].key
  var value = el(wants).value

  var convo = fulfill_desire(conversation, value)

  RM.conversation = convo
  return convo
}

function new_sentence() {
  var slots = [ {key: 'subject', type: 'word', cat: 'thing'}
              , {key: 'verb', type: 'word', cat: 'action'}
              , {key: 'object', type: 'word', cat: 'thing'}
              , {key: 'date', type: 'date'}
              ]
  return {slots: slots, filled: []}
}

function new_conversation() {
  var sentence = new_sentence()
  return {sentences: [sentence], current: sentence}
}

function fulfill_desire(conversation, value) {
  var sentence = give_word(conversation.current, value)

  // TODO: allow multi-sentence conversations


  if(!sentence.slots.length) {
    var subject, verb, object, date
    sentence.filled.forEach(function(slot) {
      if(slot.type === 'gettype') {
        var thing = add_thing(slot.value, {name: slot.name}, true)
        if(slot.oldkey === 'subject') subject = thing
        if(slot.oldkey === 'object' ) object  = thing
      }
      else if(slot.type === 'date') {
        date = slot.value
      }
      else if(slot.key === 'subject') {
        subject = slot.word
      }
      else if(slot.key === 'object') {
        object = slot.word
      }
      else if(slot.key === 'verb') {
        verb = (slot.word||{}).type || slot.value
      }
    })

    if(subject && verb && object) {
      verb = add_action(verb, {time: new Date(date).getTime() }, true)
      add_edge('the', verb._id, object._id, 0, true)
      add_edge('did', subject._id, verb._id, 0, true)
    }

    // start over
    // TODO: show the sentence
    conversation = new_conversation()
    render() // THINK: this should queue or something... rAF?
  }

  return conversation
}

function give_word(sentence, value) {
  var slot = sentence.slots.shift()
  if(!slot)
    return error('This sentence is finished')

  // TODO: check this logic modularly
  if(slot.type === 'word') {
    var word = RM.G.v({name: value, cat: slot.cat}).run()[0]
    if(word) {
      slot.word = word
    }
  }

  if(slot.cat === 'thing') {
    if(slot.type === 'word') {
      if(!slot.word) {
        sentence.slots.unshift({key: 'type', type: 'gettype', name: value, cat: slot.cat, oldkey: slot.key})
      }
    }
    else if(slot.type === 'gettype') {
      // var nameslot = sentence.filled[sentence.filled.length-1]
    }
  }

  // fix it in post
  slot.value = value
  sentence.filled.push(slot)

  return sentence
}


// INIT

function add_data(cb) {
  // if(localStorage["DAGOBA::rripplemap"]) {
  //   var data = JSON.parse(localStorage["DAGOBA::rripplemap"])
  //   load_data(data.V, data.E)
  // }
  // else if(typeof nodes === 'object' && typeof edges === 'object') {
  //   load_data(nodes, edges)
  // }

  get_data_from_server_no_questions_asked_okay(function(data) {
    // G = Dagoba.graph()
    // RM.clear()
    // var local_data = load_data(data.V, data.E)
    var local_data = load_facts(data)

    cb(local_data)
  })

  function load_facts(facts) {
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

    if(!Array.isArray(facts))
      facts = Object.keys(facts).map(k => facts[k])

    facts.forEach(function(fact) {
      // TODO: add tag support

      if(fact.action === 'add') {
        if(fact.type === 'node') {
          var node = fact.data
          var fun = window['add_' + node.cat] // FIXME: ugh erk yuck poo
          if(!fun) return false
          fun(node.type, node)
        }
        else if(fact.type === 'edge') {
          var edge = fact.data
          add_edge(edge.type, edge._out, edge._in, edge)
        }
      }
    })
  }

  function load_data(nodes, edges) {
    nodes.forEach(function(node) {
      var fun = window['add_' + node.cat] // FIXME: ugh erk yuck poo

      if(!fun) return false

      // fun(node.type, node.name, {_id: node._id})
      fun(node.type, node)
    })

    edges.forEach(function(edge) {
      add_edge(edge.type, edge._out, edge._in, edge)
    })
  }

}


function init() {
  if(location.host === "127.0.0.1") {
    if(location.hash)
      safe_mode = location.hash.slice(1)
    else
      safe_mode = true
  }

  RM.G = Dagoba.graph()

  build_pipelines()

  var cb = function() {
    render()
    render_conversation(RM.conversation)
    loading = false
  }

  add_data(cb)

  setTimeout(function() {
    render()
  }, 111)
}

init()
