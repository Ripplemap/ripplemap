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

function err(mess) {
  console.log(arguments, mess)
}

// GRAPH

var G


var RM = {}

// TODO: fix these globals

var el = document.getElementById.bind(document)
var qs = document.querySelectorAll.bind(document)

var el_ripples = el('ripples')
var el_gobutton = el('addaction')
var el_sentences = el('sentences')
var el_newaction = el('newaction')

var tau = Math.PI*2
var ctx = el_ripples.getContext('2d')



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
RM.cats.things = {}
RM.cats.actions = {}
RM.cats.effects = {}
RM.cats.happenings = {}

function get_node(catstr, typestr, props) {
  var node = convert_props(props)

  var cat = RM.cats[catstr]
  if(!cat)
    return err('that is not a valid cat', catstr)

  var type = cat[typestr]
  if(!type)
    return err('that is not a valid ' + catstr + ' type', typestr)

  // TODO: check props again the cattype's property list

  node.cat  = catstr
  node.type = typestr
  node.name = props.name || typestr // TODO: remove (or something...)

  return node
}

function add_thing(type, props) {
  var node = get_node('things', type, props)
  if(!node) return false

  node.priority = 1 // bbq???

  // publish in dagoba + persist
  publish('node', node)

  return node
}

function add_action(type, props) {
  var node = get_node('actions', type, props)
  if(!node) return false

  node.priority = 1 // bbq???

  // TODO: check props against type (what does this mean?)

  // publish in dagoba + persist
  publish('node', node)

  return node
}

function add_effect(type, props) {
  var node = get_node('effects', type, props)
  if(!node) return false

  node.priority = 0.5 // bbq???

  // publish in dagoba + persist
  publish('node', node)
}

function add_happening(type, props) {
  var node = get_node('happenings', type, props)
  if(!node) return false

  node.priority = 0.4

  // publish in dagoba + persist
  publish('node', node)
}

function new_thing_type(type, properties) {
  // TODO: valid type?

  // does this type exist already?
  var cattype = RM.cats.things[type]
  if(cattype)
    return err('That thing type already exists', type)

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
  RM.cats.things[type] = cattype

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
  var cattype = RM.cats.actions[type]
  if(cattype)
    return err('That action type already exists', type)

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
  RM.cats.actions[type] = cattype

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
  var cattype = RM.cats.effects[type]
  if(cattype)
    return err('That effect type already exists', type)

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
  RM.cats.effects[type] = cattype

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
  var cattype = RM.cats.happenings[type]
  if(cattype)
    return err('That happening type already exists', type)

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
  RM.cats.happenings[type] = cattype

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

function add_edge(type, from, to, props) {
  var edge = {}

  // check from and to
  // check type against from and to interfaces
  // publish in dagoba + persist

  edge = convert_props(props)
  edge._in = to
  edge._out = from
  edge.type = type
  edge.label = type

  publish('edge', edge)
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
  G = Dagoba.graph()
}

function story_to_text(story) {
  // what is a story?
  // how do we turn it into text?
}

function subgraph_of(thing1, thing2) {
  // find all the paths between them, and their attached bits
}

function add_alias(cat, type, alias) {
  // TODO: check alias

  // add an alias to anything
  var catcat = RM.cats[cat] || RM.cats[cat + 's'] // FIXME: oh dear goodness gravy
  if(!catcat)
    return err('Invalid cat', cat)

  var cattype = catcat[type]
  if(!cattype)
    return err('That is not a valid thing type', type)

  // add alias
  cattype.aliases.push(alias)

  // add to catcat type list
  catcat[alias] = cattype

  // THINK: alias rules?
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
new_action_type('attend',    {aliases: []})
new_action_type('manage',    {aliases: ['run', 'lead', 'facilitate', 'coordinate']})
new_action_type('assist',    {aliases: ['help', 'host', 'fund', 'contribute']})
new_action_type('present',   {aliases: []})
new_action_type('represent', {aliases: []})

new_effect_type('inspire',   {aliases: ['influenced']})
new_effect_type('convince',  {aliases: ['ask']})
new_effect_type('introduce', {aliases: ['meet']})

new_happening_type('conversation', {aliases: []})
new_happening_type('experience',   {aliases: ['see', 'hear', 'watch', 'attend']})



// MODEL HELPERS


function publish(type, item) {
  if(type === 'node') {
    G.addVertex(item)
    // TODO: persist somewhere
    persist()
    // Dagoba.persist(G, 'rripplemap')
  }

  if(type === 'edge') {
    G.addEdge(item)
    // TODO: persist somewhere
    persist()
    // Dagoba.persist(G, 'rripplemap')
  }
}

function persist() {
  // localstorage
  Dagoba.persist(G, 'rripplemap')

  // hit the server
  send_data_to_server_no_questions_asked_okay()
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

function send_data_to_server_no_questions_asked_okay() {
  if(safe_mode)
    return console.log(G)

  var json = Dagoba.jsonify(G)
  fetch('http://ripplemap.io:8888', { method: 'post'
                                    , body: json
  });
}

function get_data_from_server_no_questions_asked_okay(cb) {
  fetch('http://ripplemap.io:8888', {
	  method: 'get'
  }).then(function(response) {
    return response.json()
  }).then(function(data) {
    if(data[1])
      cb(data[1])
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

document.addEventListener('keypress', function(ev) {
  // TODO: clean this up (prevent span hijacking)
  if( ev.target.tagName === 'SPAN'
   || ev.target.tagName === 'INPUT'
   || ev.target.tagName === 'TEXTAREA'
    )
    return true

  var key = ev.keyCode || ev.which
  var f = 102
  var n = 110
  var p = 112
  var a = 97
  var s = 115
  var l = 108
  var tilde = 126

  if(key === n) {
    if(current_year >= my_maxyear) return false
    current_year++
    build_pipelines()
    render()
  }

  if(key === p) {
    if(current_year <= my_minyear) return false
    current_year--
    build_pipelines()
    render()
  }

  if(key === f) {
    filter_sentences = !filter_sentences
    render()
  }

  if(key === a) {
    all_edges = true
    render()
  }

  if(key === s) {
    all_edges = false
    render()
  }

  if(key === l) {
    show_labels = !show_labels
    render()
  }

  if(key === tilde) {
    admin_mode = !admin_mode
    render()
  }
})

el_sentences.addEventListener('keyup', function(ev) {
  var key = ev.keyCode || ev.which
  var span = ev.target
  var id = span.id
  var type = span.classList.contains('edge') ? 'edge' : 'cat'
  var val = span.innerText
  var id = span.getAttribute('data-id')

  // TODO: trap return for special effects
  // TODO: maybe trap tab also

  // ev.preventDefault()

  // handle the node case
  if(type === 'cat' && id && val) {
    var node = G.vertexIndex[id]
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

    var node1 = G.vertexIndex[id1]
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
        spans[i].innerText = val
    }
    // rerender the graph
    pipelines[0](G)
  }

})

el_sentences.addEventListener('click', function(ev) {
  var target = ev.target
  if(target.nodeName !== 'BUTTON')
    return true

  var id = target.getAttribute('data-id')
  var node = G.vertexIndex[id]

  if(!node)
    return err('That node does not exist')

  if(node.cat === 'action') { // remove "sentence"
    G.removeVertex(node)
  }
  else {
    G.removeVertex(node) // THINK: is this really reasonable?
  }

  persist()
  render()
})

el_gobutton.addEventListener('click', function(ev) {
  var thing1name = el('thing1name').value
  var thing1type = el('thing1type').value
  var thing2name = el('thing2name').value
  var thing2type = el('thing2type').value

  var actiontype = el('actiontype').value
  var actiondate = el('actiondate').value

  // check for thing1
  var thing1 = G.v({name: thing1name, type: thing1type}).run()[0]
  if(!thing1) {
    thing1 = add_thing(thing1type, {name: thing1name})
  }

  var thing2 = G.v({name: thing2name, type: thing2type}).run()[0]
  if(!thing2) {
    thing2 = add_thing(thing2type, {name: thing2name})
  }

  var action = add_action(actiontype, {time: new Date(actiondate).getTime() }) // TODO: default props to {}

  // did everything go okay?
  if(!thing1 || !thing2 || !action)
    return false

  el_newaction.reset()

  add_edge('the', action._id, thing2._id)
  add_edge('did', thing1._id, action._id)

  render()
})




// RENDER PIPELINE

// TODO: fix these globals

var safe_mode        = false // okay whatever
var all_edges        = true  // awkward... :(
var admin_mode       = false // yep another hack w00t
var my_maxyear       = 115   // total hackery...
var my_minyear       = 108   // hack hack hack
var show_labels      = false // yup
var current_year     = 115   // more hacks
var filter_sentences = true  // awkward... :(
var wrapper = {data: [], params: {}, shapes: []}
var pipelines = []
build_pipelines()

function build_pipelines() {
  pipelines[0] = pipe( Dagoba.cloneflat, sg_compact, wrap(wrapper, 'data')
                     , get_years, data_to_graph, assign_xy
                     , score_nodes, minimize_edge_length, unique_y_pos
                     , filter_years(my_maxyear, my_minyear)
                     , add_rings, add_ring_labels
                     , copy_edges, copy_nodes, add_node_labels, add_edge_labels
                     , clear_it, draw_it, draw_metadata )

  pipelines[1] = pipe( Dagoba.cloneflat, wrap(wrapper, 'data')
                     , get_actions, filter_actions
                     , make_sentences, write_sentences
                     )
}

function render() {
  pipelines[0](G)
  pipelines[1](G)
}

// SENTENCE STRUCTURES

function get_actions(env) {
  var actions = G.v({cat: 'actions'}).run() // FIXME: use env.data, not G
  env.params.actions = actions
  return env
}

function filter_actions(env) {
  if(!filter_sentences) return env
  env.params.actions = env.params.actions.filter(function(action) {
    return new Date(action.time).getYear() === current_year
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
  return list
}

function write_sentences(env) {
  el_sentences.innerHTML = ''
  env.params.sentences.forEach(function(list) {

    var sentence = '<p>'
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

    el_sentences.innerHTML += sentence
  })

  function template(classes, data, text) {
    classes.unshift('word')
    var classtext = classes.join(' ')

    var datatext = Object.keys(data).map
    (function(key)
     {return 'data-' + key + '="' + data[key] + '"'}).join(' ')

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



// COMPACTIONS

function sg_compact(graph) {
  // so... this is pretty silly i guess or something
  var g = Dagoba.graph(graph.V, graph.E)
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


// RENDER TOOLS

function wrap(env, prop) {
  return function(data) {
    var foo = clone(env)
    foo[prop] = data
    return foo
  }
}

function get_years(env) {
  var minyear = Infinity
  var maxyear = 0
  var list = env.params.years = {}

  env.data.V = env.data.V.map(function(node) {

    if(node.time < 1199161600000) return node // HACK: remove me!!!

    var year = (new Date(node.time)).getYear()
    if(year < minyear) minyear = year // effectful :(
    if(year > maxyear) maxyear = year // effectful :(

    node.year = year // mutation :(
    push_it(list, node.year, node) //, G.vertexIndex[node._id])

    return node
  })

  env.params.minyear = minyear
  env.params.maxyear = maxyear

  return env
}

function data_to_graph(env) {
  // THINK: this is kind of weird... we could probably get more leverage by just using G itself
  env.params.graph = Dagoba.graph(env.data.V, env.data.E)
  env.data.V = env.params.graph.vertices
  env.data.E = env.params.graph.edges
  return env
}

function assign_xy(env) {
  var years = env.params.years
  env.data.V.map(function(node) {
    if(node.x) return node

    var offset = node.year - 107
    var radius = offset * 50 // HACK: remove this!

    var nabes = years[node.year]
    // var gnode = G.vertexIndex[node._id]
    var index = nabes.indexOf(node)
    var arc = 2 * Math.PI / nabes.length

    var deg = offset + index * arc
    var cx  = radius * Math.cos(deg)
    var cy  = radius * Math.sin(deg)

    node.shape = 'circle'
    node.x = cx
    node.y = cy
    node.r = 4 + Math.floor(node.name.charCodeAt(0)/20)

    return node
  })

  return env
}

function score_nodes(env) {
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
        if(node.score + peer.score < score(node) + score(peer)) {
          swap(node, peer)
        } else {
          node.score = score(node)
          peer.score = score(peer)
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
  return node._in. reduce(function(acc, edge) {return acc + score_edge(edge)}, 0)
       + node._out.reduce(function(acc, edge) {return acc + score_edge(edge)}, 0)

  function score_edge(edge) {
    return Math.abs(edge._in.x - edge._out.x) + Math.abs(edge._in.y - edge._out.y)
  }
}

function filter_years(max, min) {
  max = max || Infinity
  min = min || 0

  return function(env) {

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
}

function unique_y_pos(env) {
  return env
}

function add_rings(env) {
  for(var i = env.params.minyear; i <= env.params.maxyear; i++) {
    var color = '#ccc'
    var radius = 50 * (i - 107)
    env.shapes.unshift({shape: 'circle', x: 0, y: 0, r: radius, stroke: color, fill: 'white', line: 1, type: 'ring', year: i})
  }
  return env
}

function add_ring_labels(env) {
  var labels = []

  env.shapes.filter(eq('type', 'ring')).forEach(function(shape) {
    var label = {shape: 'text', str: shape.year + 1900, x: -15, y: -shape.r - 5, fill: '#ccc' }
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

    function str_to_color(str) { return 'hsl' + (show_labels?'a':'') + '(' + str_to_num(str) + ',100%,40%' + (show_labels?',0.3':'') + ')';}
    function str_to_num(str) { return char_to_num(str, 0) + char_to_num(str, 1) + char_to_num(str, 2) }
    function char_to_num(char, index) { return (char.charCodeAt(index) % 20) * 20 }

    var line = {shape: 'line', x1: edge._in.x, y1: edge._in.y, x2: edge._out.x, y2: edge._out.y, stroke: color, type: 'edge', label: label}
    env.shapes.push(line)
  })
  return env
}

function copy_nodes(env) {
  env.shapes = env.shapes.concat(env.data.V)
  return env
}

function add_node_labels(env) {
  var labels = []

  env.shapes.forEach(function(shape) {
    if(!shape.name) return false
    var str = truncate(shape.name, 50)
    var label = {shape: 'text', str: str, x: shape.x + 10, y: shape.y + 5}
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

function clear_it(env) {
  ctx.clearRect(0, 0, 1000, 1000)
  return env
}


function draw_it(env) {
  env.shapes.forEach(function(node) {
    draw_shape(ctx, node)
  })
  return env
}

function draw_metadata(env) {
  // el('minyear').innerText = 1900 + env.params.minyear
  el('maxyear').innerText = 1900 + current_year
  return env
}


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
  ctx.arc(x, y, radius, 0, tau, false)
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
  ctx.fillStyle = fill_color || '#337'
  ctx.font = font || "14px sans-serif"
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

	var textToDraw = str;
	if (ctx.measureText && ctx.measureText(textToDraw).width > avail){
		while (textToDraw && ctx.measureText(textToDraw+"…").width > avail) textToDraw = textToDraw.slice(0,-1);
		textToDraw += "…";
	}

	// Keep text upright
	var angle = Math.atan2(dy,dx);
	if (angle < -Math.PI/2 || angle > Math.PI/2){
		x = x2
    y = y2
		dx *= -1;
		dy *= -1;
		angle -= Math.PI;
	}

  ctx.save()
	ctx.textAlign = 'center';
	ctx.translate(x+dx*pad, y+dy*pad)
	ctx.rotate(angle);
	ctx.fillText(textToDraw,0,-3);
	ctx.restore();
}



// INIT

function add_data( ) {
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
    load_data(data.V, data.E)
    render()
  })

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
  if(location.host === "127.0.0.1")
    safe_mode = true

  G = Dagoba.graph()

  add_data()

  // render()
}

init()
