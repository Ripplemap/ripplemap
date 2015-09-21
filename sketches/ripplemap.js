/*global Dagoba */

// HELPERS

function noop() {}

function eq(attr, val) {return function(obj) {return obj[attr] === val}}

function unique(v, k, list) {return list.indexOf(v) === k}

function strip(attr) {return function(obj) { delete obj[attr]; return obj }}

function comp(f, g) {return function() { var args = [].slice.call(arguments); return f(g.apply(null, args)) }}

function prop (attr) {return function(obj) {return obj[attr]}}

function cp_prop(from_attr, to_attr) {return function(obj) {obj[to_attr] = obj[from_attr]; return obj}}

function clone(obj) {return JSON.parse(JSON.stringify(obj))}

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
function build_graph() {
  // G = Dagoba.depersist('ripplemap')

  // if(G) return G

  G = Dagoba.graph()

  G.addVertices(clone(nodes))

  G.addEdges(clone(edges))

  return G
}


// SHOW IT

var RM = {}

var el = document.getElementById.bind(document)
// var qs = document.querySelectorAll.bind(document)

var el_graph = el('graph')
var el_nodes = el('nodes_ta')
var el_edges = el('edges_ta')
var el_ripples = el('ripples')
var el_sentences = el('sentences')

function show_graph(graph) {
  var text = ''

  graph.v().run().reverse().forEach(function(node) {
    text += '\n\n' + JSON.stringify(node, Dagoba.cleanVertex)
    text += '\n  in: ' + JSON.stringify(node._in, Dagoba.cleanEdge)
    text += '\n  out: ' + JSON.stringify(node._out, Dagoba.cleanEdge)
  })

  el_graph.innerText = text

  var json = Dagoba.jsonify(graph)
  var obj = JSON.parse(json)
  var nodes_text = JSON.stringify(obj.V)
  var edges_text = JSON.stringify(obj.E)

  el_nodes.value = nodes_text
  el_edges.value = edges_text
}

// SPRINGY IT

function springy_it(graph) {
  var graphJSON = {nodes: graph.vertices.map(prop('_id')), edges: graph.edges.map(function(edge) {return [edge._in._id, edge._out._id]})}

  jQuery(function(){
    var graph = new Springy.Graph()
    graph.loadJSON(graphJSON)

    var springy = jQuery('#springydemo').springy({
          graph: graph,
          damping: 0.1
        })
  })
}

// WEBCOLA IT

function webcola_it(graph) {
  var new_graph = clone(JSON.parse(Dagoba.jsonify(graph)))
  var nodes = new_graph.V
  var edges = new_graph.E
  var new_nodes = []
  nodes.forEach(function(node) {
    new_nodes[node['_id']] = node
  })

  // add fake nodes where needed (sigh)
  // var ids = new_nodes.map(prop('_id')).sort(function(a, b) {return a - b})
  // var max = ids[ids.length-1]
  // for(var i = 0; i < max; i++) {
  //   if(!~ids.indexOf(i))
  //     new_nodes[i] = {name: '___'}
  // }
  var max = new_nodes.length
  for(var i = 0; i < max; i++) {
    if(!new_nodes[i])
      new_nodes[i] = {name: '___'}
  }

  // shouldn't need this fix it blargh
  // new_nodes[0] = {name: '___'}
  // new_nodes[2] = {name: '___'}
  // new_nodes[52] = {name: '___'}
  // new_nodes[53] = {name: '___'}
  // new_nodes[116] = {name: '___'}

  graph_it([new_nodes, edges.map(cp_prop('_in', 'source')).map(cp_prop('_out', 'target')) ])
}

// RIPPLE IT

RM.ballsize = 20
RM.ringmul = 3
RM.ringspots = 12
var tau = Math.PI*2
var ctx = el_ripples.getContext('2d')

function ripple_it(graph) {
  var new_graph = clone(JSON.parse(Dagoba.jsonify(graph)))
  var nodes = new_graph.V
  var edges = new_graph.E

  // draw_circle(ctx, 100, 100, 30)

  var circles = [{stroke: 'blue', fill: 'orange', line: 5}, {stroke: 'red', line: 8, radius: 40}, {fill: 'black'}]

  circles = circles.concat(clone(circles), clone(circles), clone(circles), clone(circles))

  // draw_on_ring(ctx, 300, 300, 200, circles) // mutates

  // draw_edges(ctx, circles)

  // group nodes by timestamp
  // nodes.map(prop('time')).filter(Boolean).map(function(x) {return (new Date(x)).getYear()}).sort()
  var timed_nodes = nodes.filter(function(y) {return y.time > 1199161600000})

  var chunks = timed_nodes.reduce(function(acc, node) {
        var year = (new Date(node.time)).getYear()
        if(!acc[year])
          acc[year] = {year: year, nodes: []}
        acc[year].nodes.push(node)
        return acc
      }, {})

  Object.keys(chunks).forEach(function(year) {
    var poo = chunks[year]
    var radius = (year - 107) * 30
    draw_on_ring(ctx, 400, 400, radius, poo.nodes)
    draw_edges(ctx, poo.nodes)
  })

  var nnn = Object.keys(chunks).reduce(function(acc, key) {return acc.concat(chunks[key].nodes)}, [])

  // draw_edges(ctx, nnn)

}

function draw_on_ring(ctx, x, y, radius, circles) {
  circles.forEach(function(circle) {
    // pick a point on the ring
    var deg = Math.random() * 360
    var cx = x + radius*Math.cos(deg)
    var cy = y + radius*Math.sin(deg)
    var size = circle.size || RM.ballsize
    var stroke = circle.stroke || null
    var fill = circle.fill || null
    var line = circle.line || null

    circle.x = cx
    circle.y = cy

    draw_circle(ctx, cx, cy, size, stroke, fill, line)
  })
}

function draw_edges(ctx, points, stroke, line) {
  ctx.lineWidth = line || 2
  ctx.strokeStyle = stroke || 'red'

  points.forEach(function(point1) {
    points.forEach(function(point2) {
      draw_line(ctx, point1.x, point1.y, point2.x, point2.y)
    })
  })
}



// different kind of drawing /oy

function draw_text(ctx, x, y, str, font) {
  font = font || "12p sans-serif"
  x = x || 0
  y = y || 0
  ctx.fillText(str, x, y)
}


function draw_line(ctx, fromx, fromy, tox, toy, stroke_color, line_width) {
  // ctx.beginPath()
  // ctx.moveTo(fromx, fromy)
  // ctx.lineTo(tox, toy)
  // ctx.stroke()

  var path=new Path2D()
  path.moveTo(fromx, fromy)
  path.lineTo(tox, toy)
  ctx.strokeStyle = stroke_color || '#eef'
  ctx.lineWidth = line_width || 0.5
  ctx.stroke(path)
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

function publish(type, item) {
  if(type === 'node') {
    G.addVertex(item)
    // TODO: persist somewhere
  }

  if(type === 'edge') {
    G.addEdge(item)
    // TODO: persist somewhere
  }
}

RM.cats = {} // ripplemap categories
RM.cats.things = {}
RM.cats.actions = {}
RM.cats.effects = {}
RM.cats.happenings = {}

RM.dats = {} // ripplemap data, per cat
RM.dats.things = {}
RM.dats.actions = {}
RM.dats.effects = {}
RM.dats.happenings = {}

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

  // add data slot
  RM.dats[cat + 's'][alias]= [] // FIXME: this is horrible help help

  // add to catcat type list
  catcat[alias] = cattype

  // THINK: alias rules?
}

function convert_props(props) {
  if(typeof props !== 'object')
    return {}

  if(Array.isArray(props))
    return {}

  return clone(props)
}


function add_thing(type, props) {
  var node = convert_props(props)

  // check type against list of thing types
  var cattype = RM.cats.things[type]
  if(!cattype)
    return err('that is not a valid thing type', type)

  // check props again the thing's type's property list

  // TODO: check name
  // node.name = name
  node.type = type

  node.priority = 1 // bbq???

  // add to RM things
  RM.dats.things[type].push(node)

  // publish in dagoba + persist
  publish('node', node)
}

function add_action(type, props) {
  var node = convert_props(props)

  // check type against list of action types
  var cattype = RM.cats.actions[type]
  if(!cattype)
    return err('that is not a valid action type', type)

  node.type = type
  node.name = type // TODO: remove

  node.priority = 1 // bbq???

  // add to RM actions
  RM.dats.actions[type].push(node)

  // check type against list of action types
  // check props against type
  // publish in dagoba + persist
  publish('node', node)
}

function add_effect(type, props) {
  var node = convert_props(props)

  // check type against list of effect types
  var cattype = RM.cats.effects[type]
  if(!cattype)
    return err('that is not a valid effect type', type)

  node.type = type
  node.name = type // TODO: remove

  node.priority = 0.5 // bbq???

  // add to RM effects
  RM.dats.effects[type].push(node)

  // check type against list of effect types
  // check props against type
  // publish in dagoba + persist
  publish('node', node)
}

function add_happening(type, props) {
  var node = convert_props(props)

  // check type against list of happening types
  var cattype = RM.cats.happenings[type]
  if(!cattype)
    return err('that is not a valid happening type', type)

  node.type = type
  node.name = type // TODO: remove

  node.priority = 0.2 // bbq???

  // add to RM happenings
  RM.dats.happenings[type].push(node)

  // check type against list of happening types
  // check props
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

  // add data slot
  RM.dats.things[type] = []

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

  // add data slot
  RM.dats.actions[type] = []

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

  // add data slot
  RM.dats.effects[type] = []

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

  // add data slot
  RM.dats.happenings[type] = []

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
new_action_type('manage',    {aliases: ['run', 'lead']})
new_action_type('assist',    {aliases: ['help', 'host', 'fund']})
new_action_type('present',   {aliases: []})
new_action_type('represent', {aliases: []})

new_effect_type('inspire',   {aliases: ['influenced']})
new_effect_type('convince',  {aliases: ['ask']})
new_effect_type('introduce', {aliases: ['meet']})

new_happening_type('conversation', {aliases: []})
new_happening_type('experience',   {aliases: ['see', 'hear', 'watch', 'attend']})


// INTERACTIONS

document.addEventListener('keypress', function(ev) {
  var key = ev.keyCode || ev.which
  var n = 110
  var p = 112
  var a = 97
  var s = 115

  if(key === n) {
    maxyear++
    build_pipelines()
    render()
  }

  if(key === p) {
    maxyear--
    build_pipelines()
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
})


// RENDER PIPELINE

var all_edges = true // awkward... :(
var maxyear = 115
var minyear = 108
var wrapper = {data: [], params: {}, shapes: []}
var pipelines = []
build_pipelines()

function build_pipelines() {
  pipelines[0] = pipe( Dagoba.cloneflat, sg_compact, wrap(wrapper, 'data')
                     , get_years, assign_years, filter_years(maxyear, minyear), assign_xy, add_rings
                     , copy_edges, copy_nodes, add_labels
                     , clear_it, draw_it, draw_metadata )

  // pipelines[1] = pipe( Dagoba.cloneflat, )
}

function render() {
  pipelines[0](G)
  // pipelines[1](G)
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

    var others = ( g.v(id).in().run() ).concat( g.v(id).both().run() )
    others.forEach(function(other) {
      if(other.time)
        node.time = Math.min(node.time||Infinity, other.time)

      var oo = ( g.v(other._id).both().run() ).concat( g.v(other._id).in().run() ) // HACK: need .both
      if(oo.length < 2)
        return false

      var edge = {_in: oo[0]._id, _out: oo[1]._id}
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

  env.data.V = env.data.V.map(function(node) {

    if(node.time < 1199161600000) return node // HACK: remove me!!!

    var year = (new Date(node.time)).getYear()
    if(year < minyear) minyear = year // effectful :(
    if(year > maxyear) maxyear = year // effectful :(

    node.year = year // mutation :(
    return node
  })

  env.params.minyear = minyear
  env.params.maxyear = maxyear

  return env
}

function assign_years(env) {
  // var graph = G // FIXME: this is silly, but so is spinning up a new instance...
  var graph = Dagoba.graph(env.data.V, env.data.E)
  env.data.V = env.data.V.map(function(node) {
    if(node.year) return node
    var neighbors = graph.v(node._id).in().run() // TODO: both. also add more distance, of the right kind...
    var minyear = neighbors.map(prop('year')).filter(Boolean).sort()[0]
    if(minyear)
      node.year = minyear
    return node
  })

  return env
}

function filter_years(max, min) {
  max = max || Infinity
  min = min || 0

  return function(env) {
    // TODO: do this in Dagoba so we can erase edges automatically
    env.data.V = env.data.V.filter(function(node) {
      if(node.year > max) return false
      if(node.year < min) return false
      return true
    }
)
    return env
  }
}


function assign_xy(env) {
  var degs = {}

  env.data.V.map(function(node) {
    if(node.x) return node

    var offset = node.year - 107
    var radius = offset * 50 // HACK: remove this!

    // var deg = Math.random() * 360
    var denom = 12 + offset
    denom /= 2

    if(!degs[offset])
      degs[offset] = offset // Math.random() * 7

    degs[offset] += ((1.2*Math.PI/denom) || 0) // + (Math.random()/(2*denom))
    if(offset < 2)
      degs[offset] += 5 // special case for inner circle :(
    var deg = degs[offset]

    var cx = 0 + radius*Math.cos(deg) // 0 instead of a non-origin x and y
    var cy = 0 + radius*Math.sin(deg) // we'll take care of that later

    node.shape = 'circle'
    node.x = cx
    node.y = cy
    node.r = 8 + Math.floor(Math.random()*5)

    return node
  })

  return env
}

function add_rings(env) {
  for(var i = env.params.minyear; i <= env.params.maxyear; i++) {
    var color = 'black'
    var radius = 50 * (i - 107)
    env.shapes.unshift({shape: 'circle', x: 0, y: 0, r: radius, stroke: color, fill: 'white'})
  }
  return env
}

function copy_nodes(env) {
  env.shapes = env.shapes.concat(env.data.V)
  return env
}

function copy_edges(env) {
  env.data.E.forEach(function(edge) {
    if(!all_edges && !(edge._out.year === maxyear || edge._in.year === maxyear)) // HACK: remove this
      return false

    var line = {shape: 'line', x1: edge._in.x, y1: edge._in.y, x2: edge._out.x, y2: edge._out.y, stroke: '#f77'}
    env.shapes.push(line)
  })
  return env
}

function add_labels(env) {
  var labels = []

  env.shapes.forEach(function(shape) {
    if(!shape.name) return false
    var label = {shape: 'text', str: shape.name, x: shape.x + 10, y: shape.y + 5}
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
  el('minyear').innerText = 1900 + env.params.minyear
  el('maxyear').innerText = 1900 + maxyear
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
    draw_text(ctx, cx + node.x, cy + node.y, node.str, node.font)
}






// INIT

function add_data( ) {
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


function init() {
  // var graph = build_graph()
  G = Dagoba.graph()

  add_data()

  // show_graph(graph)
  // springy_it(graph)
  // webcola_it(graph)

  // show_graph(G)
  // ripple_it(G)
  // springy_it(G)
  // webcola_it(G)
  render()
}

init()


// INTERFACE FOR DATA...

// make a form for a thing, an action, and another thing
// name
// type
// name

// then make a form that asks questions about other things
