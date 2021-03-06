/*global Dagoba */

// THE BEGINNING

var RM = {}
RM.facts = []
RM.tags = [] // THINK: default to ['plain']?
RM.tagkeys = {}

// TODO: fix these globals

var safe_mode        = false // okay whatever
var all_edges        = true  // awkward... :(
var admin_mode       = false // yep another hack w00t
var my_maxyear       = 2016  // total hackery...
var my_minyear       = 2008  // hack hack hack
var show_labels      = false // yup
var current_year     = 2016  // more hacks
var filter_sentences = false // awkward... :(
var ring_radius      = 45    // lalala
var query            = {}    // vroom vroom

var el = document.getElementById.bind(document)
var qs = document.querySelectorAll.bind(document)

RM.el_login = el('login')
RM.el_email = el('email')
RM.el_sentences = el('sentences')
RM.el_storytime = el('storytime')
RM.el_conversation = el('the-conversation')
RM.el_addtag = el('addtag')
RM.el_othertags = el('othertags')
RM.el_tagnames = el('tagnames')

RM.ctx = el('ripples').getContext('2d')
RM.pipelines = []
RM.conversation = new_conversation()


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


// LOGIN/ORG/TAG STUFF

RM.el_login.addEventListener('submit', function(e) {
  e.preventDefault()
  RM.email = RM.el_email.value
  RM.el_login.classList.add('hide')
  RM.el_storytime.classList.remove('hide')
})

// SOME HIGHLIGHTING OR SOMETHING

var highlight_fun, highlight_target

RM.el_sentences.addEventListener('mouseover', activate_highlighter)
RM.el_sentences.addEventListener('mouseout', deactivate_highlighter)

function activate_highlighter() {
  highlight_fun = RM.el_sentences.addEventListener('mousemove', highlighter)
}

function deactivate_highlighter() {
  RM.el_sentences.removeEventListener('mousemove', highlight_fun)
}

function highlighter(e) {
  for(var t=e.target; t && t.matches; t = t.parentNode) {
    if(t.matches('.sentence')) {
      if(highlight_target === t)
        return false

      highlight_target = t
      var ids = [].slice.call(t.children).map(node => node.dataset.id).filter(Boolean)
      var fun = function(v) {return ~ids.indexOf(v._id)}
      // ids.forEach(id => RM.G.v(id).run()[0].highlight = true)
      // render()
      highlight(fun)
      return false
    }
  }
}

function highlight(o_or_f) {
  var current = RM.G.v({highlight: true}).run()
  current.forEach(function(node) {
    // node.highlight = false
    delete node.highlight // better when collapsing
  })

  if(!o_or_f) {
    render()
    return false
  }

  if(typeof o_or_f === 'function') {
    current = RM.G.v().filter(o_or_f).run()
  } else {
    current = RM.G.v(o_or_f).run()
  }

  current.forEach(function(node) {
    node.highlight = true
  })

  render()
}


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

  // THINK: if Dagoba supported proper subgraphs, we could have RM.facts and RM.G and keep them fully in sync, instead of limiting RM.G to just the "viewable" facts. we'll need a new RM.GG or something for the currently viewable subgraph. this would also help with all the duplicate node warning messages, cut down on allocations, and allow a pipeline based around building new graphs (or extending/syncing the main graph from the factbase). so facts_to_graph would take a graph and some facts and put them together, or something. or as you add new facts they're automatically ramified into the graph. or fizzlemorts.

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
new_action_type('inspire',   {aliases: []})
new_action_type('invite',    {aliases: []})

new_effect_type('inspire',   {aliases: ['influenced']})
new_effect_type('convince',  {aliases: ['ask']})
new_effect_type('introduce', {aliases: ['meet']})

new_happening_type('conversation', {aliases: []})
new_happening_type('experience',   {aliases: ['see', 'hear', 'watch', 'attend']})




// MODEL HELPERS

var loading = true // TODO: fix this

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

  // FIXME: present splash page of some kind

  var fact = { email: RM.email
             , action: 'add'
             , type: type
             , tags: RM.tags
             , data: item
             }

  send_data_to_server(fact)
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
  return ("" + Math.random()).slice(2)
}

function persist() {
  // THINK: do we still need localstorage caching?
  Dagoba.persist(RM.G, 'rripplemap')
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

  fetch(url, { method: 'post'
             , body: JSON.stringify(data)
  }).then(function(response) {
    return response.json()
  }).then(function(result) {
    if(cb)
      cb(result)
  })
}

function get_facts_from_server(cb) {
  var url = 'http://ripplemap.io:8888'

  // local shunt for airplane mode
  if(safe_mode === 'local')
    return cb(JSON.parse(localStorage['DAGOBA::ripmapdata']))

  if(safe_mode === 'daring') {
    url = 'http://localhost:8888'
  }

  fetch(url, {
    method: 'get'
  }).then(function(response) {
    return response.json()
  }).then(function(data) {
    cb(data)
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


// TODO: partition incoming bleep bloops by action
// TODO: build edit functions
// TODO: build remove functions
// TODO: ask user for email address
// TODO: show current tags
// TODO: allow changing of tags
// TODO: allow multitag views
// TODO: add all tags on server
// TODO: try to get an additional compaction in

// TODO: consolidate like-named nodes
// TODO: consolidate email addresses on server
// TODO: copy tags into url




// INTERACTIONS & DOM BINDINGS

RM.el_tagnames.addEventListener('click', function(ev) {
  ev.preventDefault()
  var target = ev.target
  var tag = target.innerText
  if(!tag) return false
  removetag(tag)
})

RM.el_tagnames.addEventListener('mouseover', function(ev) {
  var target = ev.target
  var tag = target.innerText

  if(!tag)
    return false

  if(highlight_target === tag)
    return false

  highlight_target = tag
  highlight(function(v) { return ~v.tags.indexOf(tag) })
})

RM.el_tagnames.addEventListener('mouseout', function(ev) {
  if(!highlight_target)
    return false

  highlight_target = false
  highlight()
})

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
  var key_n = 78
  var key_p = 80
  // var key_s = 115
  var tilde = 126
  var larro = 37
  var uarro = 38
  var rarro = 39
  var darro = 40
  // var langl = 60
  // var rangl = 62

  if(key === larro || key === darro || key === key_p) {
    ev.preventDefault()
    if(current_year <= my_minyear) return false
    current_year--
    render()
  }

  if(key === rarro || key === uarro || key === key_n) {
    ev.preventDefault()
    if(current_year >= my_maxyear) return false
    current_year++
    render()
  }

  if(key === key_f) {
    filter_sentences = !filter_sentences
    render()
  }

  if(key === key_e) {
    all_edges = !all_edges
    render()
  }

  if(key === key_l) {
    show_labels = !show_labels
    render()
  }

  if(key === tilde) {
    admin_mode = !admin_mode
    render()
  }
})

RM.el_addtag.addEventListener('submit', function(ev) {
  ev.preventDefault()
  addtag(RM.el_othertags.value)
})

RM.el_sentences.addEventListener('keyup', function(ev) {
  // var key = ev.keyCode || ev.which
  var span = ev.target
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
        {return ( edge._in._id === id1 && edge._out._id === id2 )
             || ( edge._in._id === id2 && edge._out._id === id1 ) })[0]

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

RM.el_conversation.addEventListener('submit', function(ev) {
  ev.preventDefault()

  whatsnext(RM.graph, join_conversation(RM.conversation))

  return false
})


// RENDER PIPELINE

function build_pipelines() {
  // TODO: consider a workflow for managing this tripartite pipeline, so we can auto-cache etc
  RM.pipelines[0] = pipe( mod('data', sg_compact)
                        , mod('data', likenamed)
                        , mod('data', clusters)
                        , mod('data', Dagoba.cloneflat)
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

function sg_compact(g) {
  // so... this is pretty silly i guess or something. use subgraphs instead.
  var newg = Dagoba.graph()
  var edges = []

  g.v().run().forEach(function(node) {
    if(node.time)
      return false

    var others = g.v(node._id).both().run()
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

  return newg
}

function likenamed(g) {
  var namemap = {}

  g.v().run().forEach(function(node) {
    if(!node.name)
      return false

    if(!namemap[node.name]) {
      namemap[node.name] = [node]
    }
    else {
      namemap[node.name].push(node)
    }
  })

  Object.keys(namemap).forEach(function(name) {
    if(namemap[name].length > 1)
      g.mergeVertices(namemap[name])
  })

  return g
}

RM.clusters = [ ['AMC', 'amc', 'Allied Media Conference', 'allied media conference', 'Allied media Conference']
              , ['AMP', 'amp', 'Allied Media Projects', 'allied media projects']
              , ['AMC2016 Coordinators Weekend', 'AMC 2016 Coordinators Meeting']
              , ['jayy dodd', 'jayy']
              ]

function clusters(g) {
  RM.clusters.map(function(names) {
    return names.reduce(function(acc, name) {
      return acc.concat(g.v({name: name}).run())
    }, [])
  }).forEach(g.mergeVertices.bind(g))

  return g
}

// LAYOUT

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

      ys.sort(function(a, b) {return a - b}) // OPT: just insert coords.y in place
    })
  })

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
  env.shapes = env.shapes.concat.apply(env.shapes, env.data.V.map(function(node) {
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

    if(!node.highlight)
      return shape

    var highlight = { shape: 'circle'
                    , x: node.x
                    , y: node.y
                    , r: node.r + 12
                    , line: 0.01
                    , fill: 'hsla(0, 80%, 50%, 0.20)'
                    }

    return [highlight, shape]
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
  env.params.actions = env.params.actions.map(function(action) {
    action.year = new Date(action.time+100000000).getFullYear()
    return action
  })

  if(!filter_sentences) return env

  env.params.actions = env.params.actions.filter(function(action) {
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
    var innerwords = ''
    var highlight_count = 0

    if(list.year !== oldyear) {
      sentence = '<h2>' + list.year + '</h2>'
      oldyear = list.year
    }

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

      if(thing.highlight)
        highlight_count++

      if(type !== 'edge')
        data = {id: thing._id||''}
      else
        data = {id1: thing._in._id, id2: thing._out._id}

      if(!admin_mode)
        innerwords += template(classes, data, word)
      else
        innerwords += admin_template(thing, type, cat, word)
    })

    var sentence_classes = 'sentence'
    sentence_classes += highlight_count === 3 ? ' highlight' : ''
    sentence += '<p class="' + sentence_classes + '">' + innerwords + '.</p>'

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

function render_conversation(conversation) {
  var typeahead_params = {hint: true, highlight: true, minLength: 1}
  function typeahead_source(cat) {return {name: 'states', source: function(q, cb) {cb(get_cat_dat(cat, q))}}}

  var inputs = ''
  var prelude = ''
  var submit_button = '<input type="submit" style="position: absolute; left: -9999px">'

  // special case the first step
  var sentence = conversation.current

  sentence.filled.forEach(function(slot, i) {
    prelude += inject_value(slot, slot.value, i) + ' '
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
      var options = ['participate in', 'lead', 'fund', 'organize', 'inspire', 'invite']
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
    var str = '<input id="' +key+ '" type="date" name="' +key+ '" value="2016-01-01" />'
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


function render_all() {
  render()
  render_conversation(RM.conversation)
  showtags()
}

// INIT

function add_data(cb) {
  get_facts_from_server(function(facts) {
    cb(fact_to_graph(capture_facts(facts)))
  })
}

function capture_facts(facts) {
  RM.facts = facts
  return facts
}

function fact_to_graph(facts) {
  /*

   data model:
   user: id
   action: add/remove/edit
   type: node/edge
   tags: [...]
   org: id
   [maybe other stats can live here?]
   data:
   node: {id, name, type, cat...}
   edge: {_in, _out, type, label}

   */

  var tree = factor_facts(filter_facts(facts))
  RM.tagkeys = get_tagkeys(facts)

  tree.nodes.add.forEach(function(node) {
    var fun = window['add_' + node.cat] // FIXME: ugh erk yuck poo
    if(!fun) return false
    fun(node.type, node)
  })

  tree.edges.add.forEach(function(edge) { // we need to delay these so the nodes are all in place (sometimes the facts get added in weird orders)
    add_edge(edge.type, edge._out, edge._in, edge)
  })

  tree.nodes.edit.forEach(function(node) {
    RM.graph.edit(node) //////
  })
}

function get_tagkeys(facts) {
  var keys = {}
  facts.forEach(function(fact) {
    ~(fact.tags||[]).forEach(function(tag) {
      keys[tag] = true
    })
  })
  return keys
}

function filter_facts(facts) {
  facts = facts.filter(function(fact) {
    return !!set_intersect(fact.tags, RM.tags).length // THINK: this implies no empty tag arrays (so 'plain' as default?)
  })

  return facts
}

function factor_facts(facts) {
  var tree = {nodes: {add: [], edit: [], remove: []}, edges: {add: [], edit: [], remove: []}}
  facts.forEach(function(fact) {
    // var branch = tree[fact.type+'s']
    // var list = branch[fact.action] || []
    // if(!branch[fact.action])
    //   branch[fact.action] = list
    var list = tree[fact.type+'s'][fact.action] // TODO: error handling

    // var item = clone(fact.data)
    var item = fact.data // THINK: is mutating here okay?
    item.org = fact.org
    item.user = fact.user
    item.tags = fact.tags
    list.push(item)
  })
  return tree
}

function set_intersect(xs, ys) {
  return xs.filter(function(x) {
    return ys.indexOf(x) !== -1
  })
}

function set_minus(xs, ys) {
  return xs.filter(function(x) {
    return ys.indexOf(x) === -1
  })
}

function addtag(tag) {
  RM.tags.push(tag)
  RM.G = Dagoba.graph()
  fact_to_graph(RM.facts)
  render_all()
}

function removetag(tag) {
  var index = RM.tags.indexOf(tag)
  if(index === -1)
    return false

  RM.tags.splice(index, 1)
  RM.G = Dagoba.graph()
  fact_to_graph(RM.facts)
  render_all()
}

function showtags() {
  // generate current tags
  // hoverable span for highlight, plus clickable for remove
  var tagwrapper = ['<span class="tag">', '</span>']
  var tagstr = RM.tags.map(function(tag) { return tagwrapper[0] + tag + tagwrapper[1] }).join(', ')
  RM.el_tagnames.innerHTML = tagstr

  // generate select box
  var unused = set_minus(Object.keys(RM.tagkeys), RM.tags).sort()
  var optionstr = '<option>' + unused.join('</option><option>') + '</option>'
  RM.el_othertags.innerHTML = optionstr
}


function init() {
  if(window.location.host === "127.0.0.1") {
    if(window.location.hash)
      safe_mode = window.location.hash.slice(1)
    else
      safe_mode = true
  }

  if(window.location.search) {
    query = window.location.search.substr(1).split('&').reduce(function(acc, pair) {
      var p = pair.split('=')
      acc[p[0]] = p[1]
      return acc
    }, {})
    if(query.tag)
      RM.tags = [query.tag]
    else if(query.tags)
      RM.tags = query.tags.split('|')
  }

  RM.G = Dagoba.graph()

  build_pipelines()

  function cb() {
    render_all()
    loading = false // TODO: get rid of this somehow
  }

  add_data(cb)

  setTimeout(function() {
    render()
  }, 111)
}

init()
