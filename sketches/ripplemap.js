/*global Dagoba */

// VERTICES

var nodes = [ {"name": "Cayden Makk", "type": "person", "_id": 1}
            , {"name": "Andy Gunn", "type": "person", "_id": 4}
            , {"name": "Sasha Costanzachock", "type": "person", "_id": 5}
            , {"name": "Nina Bianchi", "type": "person", "_id": 6}
            , {"name": "Chance Williams", "type": "person", "_id": 7}
            , {"name": "Amalia Daloney", "type": "person", "_id": 8}
            , {"name": "FCC", "type": "org", "_id": 9}
            , {"name": "Josh Breitbart", "type": "person", "_id": 15}
            , {"name": "Hannah Sassaman", "type": "person", "_id": 16}
            , {"name": "Alfredo Lopez", "type": "person", "_id": 17}
            , {"name": "Emi Kane", "type": "person", "_id": 19}
            , {"name": "Seeta Gangadharon", "type": "person", "_id": 20}
            , {"name": "Sarah Morris", "type": "person", "_id": 25}
            , {"name": "Mary Alice Crim", "type": "person", "_id": 30}
            , {"name": "Liza Dichter", "type": "person", "_id": 32}
            , {"name": "Joe Torres", "type": "person", "_id": 34}
            , {"name": "Danielle Chynoweth", "type": "person", "_id": 35}
            , {"name": "Steven Renderos", "type": "person", "_id": 54}
            , {"name": "AMC", "type": "org", "_id": 3}
            , {"name": "US Circuit Court", "type": "org", "_id": 11}
            , {"name": "Legacy Civil Rights Groups", "type": "org", "_id": 12}
            , {"name": "18MR", "type": "org", "_id": 18}
            , {"name": "Free Press", "type": "org", "_id": 33}
            , {"name": "OTI", "type": "org", "_id": 36}
            , {"name": "Media Mobilizing Project", "type": "org", "_id": 37}
            , {"name": "Magnet", "type": "org", "_id": 38}
            , {"name": "DDJC", "type": "org", "_id": 39}
            , {"name": "CMJ", "type": "org", "_id": 40}
            , {"name": "18 MR", "type": "org", "_id": 46}
            , {"name": "OSF", "type": "org", "_id": 47}
            , {"name": "Open Internet Order", "type": "event", "_id": 10}
            , {"name": "Games Track", "type": "event", "_id": 13}
            , {"name": "Coordinators retreat", "type": "event", "_id": 14}
            , {"name": "Section 706 V Title 2", "type": "event", "_id": 21}
            , {"name": "brought to org - another Asian American voice", "type": "event", "_id": 22}
            , {"name": "Media Rights Track", "type": "event", "_id": 23}
            , {"name": "Blogging from prison workshop in webmaking track", "type": "event", "_id": 24}
            , {"name": "2 or 3 open internet princples", "type": "event", "_id": 26}
            , {"name": "How to make policy concepts session", "type": "event", "_id": 27}
            , {"name": "Securities surveillance track", "type": "event", "_id": 28}
            , {"name": "POC Deligation", "type": "event", "_id": 29}
            , {"name": "Title 2", "type": "event", "_id": 31}
            , {"name": "Mobile Justice: The Next Frontier.", "type": "event", "_id": 41}
            , {"name": "Visioning Our Media Policy Future", "type": "event", "_id": 42}
            , {"name": "Coordinators Retreat", "type": "event", "_id": 43}
            , {"name": "Racial Justice and Surveilance Natwork Gathering", "type": "event", "_id": 44}
            , {"name": "Town Hall", "type": "event", "_id": 45}
            , {"name": "Racial Justice & Surveillance network gathering", "type": "event", "_id": 48}
            , {"name": "breifing on Capitol Hill", "type": "event", "_id": 49}
            , {"name": "hearing for FTC", "type": "event", "_id": 50}
            , {"name": "Internet Slowdown Day", "type": "event", "_id": 51}
            , {"name": "a track?", "type": "event", "_id": 138}
            , {"name": "Panel on Net Neutrality & racial Justice", "type": "event", "_id": 139}
            , {"name": "Net Neutrality & Social Movements History", "type": "event", "_id": 140}
            , {"name": "free & open communities", "type": "event", "_id": 141}
            , {"type": "happening", "time": 1199163600000, "name": "involved in", "_id": 55}
            , {"type": "happening", "time": 1262322000000, "name": "attended", "_id": 56}
            , {"type": "happening", "time": 1262322000000, "name": "connected", "_id": 57}
            , {"type": "happening", "time": 1262322000000, "name": "met", "_id": 58}
            , {"type": "happening", "time": 1276574400000, "name": "talked with", "_id": 59}
            , {"type": "happening", "time": 1276574400000, "name": "talked with", "_id": 60}
            , {"type": "happening", "time": 1276574400000, "name": "talked with", "_id": 61}
            , {"type": "happening", "time": 1276574400000, "name": "talked with", "_id": 62}
            , {"type": "happening", "time": 1292389200000, "name": "creates", "_id": 63}
            , {"type": "happening", "time": 1292389200000, "name": "verbs", "_id": 64}
            , {"type": "happening", "time": 1292389200000, "name": "verbs", "_id": 65}
            , {"type": "happening", "time": 1292389200000, "name": "verbs", "_id": 66}
            , {"type": "happening", "time": 1293858000000, "name": "coordinates", "_id": 67}
            , {"type": "happening", "time": 1293858000000, "name": "attended", "_id": 68}
            , {"type": "happening", "time": 1293858000000, "name": "connected", "_id": 69}
            , {"type": "happening", "time": 1293858000000, "name": "connected", "_id": 70}
            , {"type": "happening", "time": 1293858000000, "name": "met", "_id": 71}
            , {"type": "happening", "time": 1293858000000, "name": "met", "_id": 72}
            , {"type": "happening", "time": 1293858000000, "name": "met", "_id": 73}
            , {"type": "happening", "time": 1293858000000, "name": "met", "_id": 74}
            , {"type": "happening", "time": 1325394000000, "name": "co-founded", "_id": 75}
            , {"type": "happening", "time": 1325394000000, "name": "carried", "_id": 76}
            , {"type": "happening", "time": 1357016400000, "name": "appeared at", "_id": 77}
            , {"type": "happening", "time": 1357016400000, "name": "met", "_id": 78}
            , {"type": "happening", "time": 1357016400000, "name": "met", "_id": 79}
            , {"type": "happening", "time": 1357016400000, "name": "", "_id": 80}
            , {"type": "happening", "time": 1357016400000, "name": "", "_id": 81}
            , {"type": "happening", "time": 1357016400000, "name": "attends", "_id": 82}
            , {"type": "happening", "time": 1357016400000, "name": "needs verb: attended, started?", "_id": 83}
            , {"type": "happening", "time": 1388552400000, "name": "met", "_id": 84}
            , {"type": "happening", "time": 1389762000000, "name": "vacates", "_id": 85}
            , {"type": "happening", "time": 1388552400000, "name": "leads?", "_id": 86}
            , {"type": "happening", "time": 1388552400000, "name": "needs verb: attended, started?", "_id": 87}
            , {"type": "happening", "time": 1416027600000, "name": "attends", "_id": 88}
            , {"type": "happening", "time": 1420088400000, "name": "co-presented", "_id": 89}
            , {"type": "happening", "time": 1423976400000, "name": "approves", "_id": 90}
            , {"type": "happening", "time": 978325200000, "name": "met", "_id": 91}
            , {"type": "happening", "time": 978325200000, "name": "met", "_id": 92}
            , {"type": "happening", "time": 978325200000, "name": "met", "_id": 93}
            , {"type": "happening", "time": 1262322000000, "name": "met", "_id": 94}
            , {"type": "happening", "time": 1262322000000, "name": "works at", "_id": 95}
            , {"type": "happening", "time": 1262322000000, "name": "met", "_id": 96}
            , {"type": "happening", "time": 1325394000000, "name": "met", "_id": 97}
            , {"type": "happening", "time": 1357016400000, "name": "met", "_id": 98}
            , {"type": "happening", "time": 978325200000, "name": "works at", "_id": 99}
            , {"type": "happening", "time": 978325200000, "name": "works at", "_id": 100}
            , {"type": "happening", "time": 978325200000, "name": "works at", "_id": 101}
            , {"type": "happening", "time": 978325200000, "name": "works at", "_id": 102}
            , {"type": "happening", "time": 978325200000, "name": "works at", "_id": 103}
            , {"type": "happening", "time": 978325200000, "name": "works at", "_id": 104}
            , {"type": "happening", "time": 978325200000, "name": "works at", "_id": 105}
            , {"type": "happening", "time": 978325200000, "name": "works at", "_id": 106}
            , {"type": "happening", "time": 1326603600000, "name": "attended", "_id": 107}
            , {"type": "happening", "time": 1262322000000, "name": "met", "_id": 108}
            , {"type": "happening", "time": 1339732800000, "name": "led", "_id": 109}
            , {"type": "happening", "time": 1339732800000, "name": "attended", "_id": 110}
            , {"type": "happening", "time": 1371268800000, "name": "", "_id": 111}
            , {"type": "happening", "time": 1389762000000, "name": "attended", "_id": 112}
            , {"type": "happening", "time": 1402804800000, "name": "led?", "_id": 113}
            , {"type": "happening", "time": 1421298000000, "name": "hosted", "_id": 114}
            , {"type": "happening", "time": 1418619600000, "name": "worked", "_id": 115}
            , {"type": "happening", "time": 1434340800000, "name": "moved to", "_id": 116}
            , {"type": "happening", "time": 1426392000000, "name": "phoned", "_id": 117}
            , {"type": "happening", "time": 1389762000000, "name": "met", "_id": 118}
            , {"type": "happening", "time": 1389762000000, "name": "attended", "_id": 119}
            , {"type": "happening", "time": 1389762000000, "name": "attended", "_id": 120}
            , {"type": "happening", "time": 1402804800000, "name": "coordinated", "_id": 121}
            , {"type": "happening", "time": 1423976400000, "name": "spoke at", "_id": 122}
            , {"type": "happening", "time": 1423976400000, "name": "hosted", "_id": 123}
            , {"type": "happening", "time": 1413345600000, "name": "spoke at", "_id": 124}
            , {"type": "happening", "time": 1413345600000, "name": "organized", "_id": 125}
            , {"type": "happening", "time": 1410753600000, "name": "organized", "_id": 126}
            , {"type": "happening", "time": 1410753600000, "name": "found funding", "_id": 127}
            , {"type": "happening", "time": 1371268800000, "name": "met", "_id": 128}
            , {"type": "happening", "time": 1402804800000, "name": "coordinated", "_id": 129}
            , {"type": "happening", "time": 1429070400000, "name": "spoke at", "_id": 130}
            , {"type": "happening", "time": 1429070400000, "name": "spoke at", "_id": 131}
            , {"type": "happening", "time": 1434340800000, "name": "coordinated", "_id": 132}
            , {"type": "happening", "time": 1434340800000, "name": "coordinated", "_id": 133}
            , {"type": "happening", "time": 1434340800000, "name": "coordinated", "_id": 134}
            , {"type": "happening", "time": 1434340800000, "name": "coordinated", "_id": 135}
            , {"type": "happening", "time": 1413345600000, "name": "organized", "_id": 136}
            , {"type": "happening", "time": 1392440400000, "name": "spoke at", "_id": 137}
            ]


// EDGES

var edges = [ {"type": "did", "_in": 1, "_out": 55}
            , {"type": "did", "_in": 141, "_out": 55}
            , {"type": "did", "_in": 1, "_out": 130}
            , {"type": "did", "_in": 3, "_out": 131}
            , {"type": "did", "_in": 1, "_out": 57}
            , {"type": "did", "_in": 4, "_out": 57}
            , {"type": "did", "_in": 1, "_out": 58}
            , {"type": "did", "_in": 5, "_out": 58}
            , {"type": "did", "_in": 1, "_out": 59}
            , {"type": "did", "_in": 6, "_out": 59}
            , {"type": "did", "_in": 1, "_out": 60}
            , {"type": "did", "_in": 4, "_out": 60}
            , {"type": "did", "_in": 1, "_out": 61}
            , {"type": "did", "_in": 7, "_out": 61}
            , {"type": "did", "_in": 1, "_out": 62}
            , {"type": "did", "_in": 8, "_out": 62}
            , {"type": "did", "_in": 9, "_out": 63}
            , {"type": "did", "_in": 10, "_out": 63}
            , {"type": "did", "_in": 9, "_out": 64}
            , {"type": "did", "_in": 11, "_out": 64}
            , {"type": "did", "_in": 9, "_out": 65}
            , {"type": "did", "_in": 12, "_out": 65}
            , {"type": "did", "_in": 9, "_out": 66}
            , {"type": "did", "_in": 1, "_out": 66}
            , {"type": "did", "_in": 1, "_out": 67}
            , {"type": "did", "_in": 13, "_out": 67}
            , {"type": "did", "_in": 1, "_out": 68}
            , {"type": "did", "_in": 14, "_out": 68}
            , {"type": "did", "_in": 1, "_out": 69}
            , {"type": "did", "_in": 7, "_out": 69}
            , {"type": "did", "_in": 1, "_out": 70}
            , {"type": "did", "_in": 6, "_out": 70}
            , {"type": "did", "_in": 1, "_out": 71}
            , {"type": "did", "_in": 15, "_out": 71}
            , {"type": "did", "_in": 1, "_out": 72}
            , {"type": "did", "_in": 16, "_out": 72}
            , {"type": "did", "_in": 1, "_out": 73}
            , {"type": "did", "_in": 6, "_out": 73}
            , {"type": "did", "_in": 1, "_out": 74}
            , {"type": "did", "_in": 17, "_out": 74}
            , {"type": "did", "_in": 1, "_out": 75}
            , {"type": "did", "_in": 18, "_out": 75}
            , {"type": "did", "_in": 1, "_out": 76}
            , {"type": "did", "_in": 3, "_out": 76}
            , {"type": "did", "_in": 18, "_out": 77}
            , {"type": "did", "_in": 3, "_out": 77}
            , {"type": "did", "_in": 1, "_out": 78}
            , {"type": "did", "_in": 19, "_out": 78}
            , {"type": "did", "_in": 1, "_out": 79}
            , {"type": "did", "_in": 20, "_out": 79}
            , {"type": "did", "_in": 12, "_out": 80}
            , {"type": "did", "_in": 21, "_out": 80}
            , {"type": "did", "_in": 18, "_out": 81}
            , {"type": "did", "_in": 22, "_out": 81}
            , {"type": "did", "_in": 1, "_out": 82}
            , {"type": "did", "_in": 23, "_out": 82}
            , {"type": "did", "_in": 1, "_out": 83}
            , {"type": "did", "_in": 24, "_out": 83}
            , {"type": "did", "_in": 1, "_out": 84}
            , {"type": "did", "_in": 25, "_out": 84}
            , {"type": "did", "_in": 11, "_out": 85}
            , {"type": "did", "_in": 26, "_out": 85}
            , {"type": "did", "_in": 25, "_out": 86}
            , {"type": "did", "_in": 27, "_out": 86}
            , {"type": "did", "_in": 1, "_out": 87}
            , {"type": "did", "_in": 28, "_out": 87}
            , {"type": "did", "_in": 1, "_out": 88}
            , {"type": "did", "_in": 29, "_out": 88}
            , {"type": "did", "_in": 1, "_out": 89}
            , {"type": "did", "_in": 30, "_out": 89}
            , {"type": "did", "_in": 9, "_out": 90}
            , {"type": "did", "_in": 31, "_out": 90}
            , {"type": "did", "_in": 1, "_out": 91}
            , {"type": "did", "_in": 30, "_out": 91}
            , {"type": "did", "_in": 1, "_out": 92}
            , {"type": "did", "_in": 32, "_out": 92}
            , {"type": "did", "_in": 1, "_out": 93}
            , {"type": "did", "_in": 8, "_out": 93}
            , {"type": "did", "_in": 1, "_out": 94}
            , {"type": "did", "_in": 4, "_out": 94}
            , {"type": "did", "_in": 7, "_out": 95}
            , {"type": "did", "_in": 33, "_out": 95}
            , {"type": "did", "_in": 1, "_out": 96}
            , {"type": "did", "_in": 7, "_out": 96}
            , {"type": "did", "_in": 1, "_out": 97}
            , {"type": "did", "_in": 34, "_out": 97}
            , {"type": "did", "_in": 1, "_out": 98}
            , {"type": "did", "_in": 35, "_out": 98}
            , {"type": "did", "_in": 15, "_out": 99}
            , {"type": "did", "_in": 36, "_out": 99}
            , {"type": "did", "_in": 16, "_out": 100}
            , {"type": "did", "_in": 37, "_out": 100}
            , {"type": "did", "_in": 34, "_out": 101}
            , {"type": "did", "_in": 33, "_out": 101}
            , {"type": "did", "_in": 35, "_out": 102}
            , {"type": "did", "_in": 38, "_out": 102}
            , {"type": "did", "_in": 6, "_out": 103}
            , {"type": "did", "_in": 39, "_out": 103}
            , {"type": "did", "_in": 4, "_out": 104}
            , {"type": "did", "_in": 36, "_out": 104}
            , {"type": "did", "_in": 8, "_out": 105}
            , {"type": "did", "_in": 40, "_out": 105}
            , {"type": "did", "_in": 25, "_out": 106}
            , {"type": "did", "_in": 36, "_out": 106}
            , {"type": "did", "_in": 1, "_out": 107}
            , {"type": "did", "_in": 14, "_out": 107}
            , {"type": "did", "_in": 1, "_out": 108}
            , {"type": "did", "_in": 7, "_out": 108}
            , {"type": "did", "_in": 7, "_out": 109}
            , {"type": "did", "_in": 41, "_out": 109}
            , {"type": "did", "_in": 1, "_out": 110}
            , {"type": "did", "_in": 42, "_out": 110}
            , {"type": "did", "_in": 1, "_out": 111}
            , {"type": "did", "_in": 7, "_out": 111}
            , {"type": "did", "_in": 1, "_out": 112}
            , {"type": "did", "_in": 43, "_out": 112}
            , {"type": "did", "_in": 7, "_out": 113}
            , {"type": "did", "_in": 44, "_out": 113}
            , {"type": "did", "_in": 7, "_out": 114}
            , {"type": "did", "_in": 45, "_out": 114}
            , {"type": "did", "_in": 1, "_out": 115}
            , {"type": "did", "_in": 46, "_out": 115}
            , {"type": "did", "_in": 7, "_out": 116}
            , {"type": "did", "_in": 47, "_out": 116}
            , {"type": "did", "_in": 1, "_out": 117}
            , {"type": "did", "_in": 7, "_out": 117}
            , {"type": "did", "_in": 1, "_out": 118}
            , {"type": "did", "_in": 34, "_out": 118}
            , {"type": "did", "_in": 1, "_out": 119}
            , {"type": "did", "_in": 14, "_out": 119}
            , {"type": "did", "_in": 34, "_out": 120}
            , {"type": "did", "_in": 14, "_out": 120}
            , {"type": "did", "_in": 34, "_out": 121}
            , {"type": "did", "_in": 48, "_out": 121}
            , {"type": "did", "_in": 1, "_out": 122}
            , {"type": "did", "_in": 49, "_out": 122}
            , {"type": "did", "_in": 34, "_out": 123}
            , {"type": "did", "_in": 49, "_out": 123}
            , {"type": "did", "_in": 1, "_out": 124}
            , {"type": "did", "_in": 50, "_out": 124}
            , {"type": "did", "_in": 34, "_out": 125}
            , {"type": "did", "_in": 50, "_out": 125}
            , {"type": "did", "_in": 1, "_out": 126}
            , {"type": "did", "_in": 51, "_out": 126}
            , {"type": "did", "_in": 34, "_out": 127}
            , {"type": "did", "_in": 51, "_out": 127}
            , {"type": "did", "_in": 1, "_out": 128}
            , {"type": "did", "_in": 54, "_out": 128}
            , {"type": "did", "_in": 54, "_out": 129}
            , {"type": "did", "_in": 138, "_out": 129}
            , {"type": "did", "_in": 1, "_out": 130}
            , {"type": "did", "_in": 130, "_out": 139}
            , {"type": "did", "_in": 54, "_out": 131}
            , {"type": "did", "_in": 131, "_out": 139}
            , {"type": "did", "_in": 1, "_out": 132}
            , {"type": "did", "_in": 132, "_out": 140}
            , {"type": "did", "_in": 16, "_out": 133}
            , {"type": "did", "_in": 133, "_out": 140}
            , {"type": "did", "_in": 30, "_out": 134}
            , {"type": "did", "_in": 134, "_out": 140}
            , {"type": "did", "_in": 54, "_out": 135}
            , {"type": "did", "_in": 135, "_out": 140}
            , {"type": "did", "_in": 54, "_out": 136}
            , {"type": "did", "_in": 50, "_out": 136}
            , {"type": "did", "_in": 54, "_out": 137}
            , {"type": "did", "_in": 49, "_out": 137}]

// HELPERS

function eq(attr, val) {return function(obj) {return obj[attr] === val}}

function unique(v, k, list) {return list.indexOf(v) === k}

function strip(attr) {return function(obj) { delete obj[attr]; return obj }}

function comp(f, g) {return function() { var args = [].slice.call(arguments); return f(g.apply(null, args)) }}

function prop (attr) {return function(obj) {return obj[attr]}}

function cp_prop(from_attr, to_attr) {return function(obj) {obj[to_attr] = obj[from_attr]; return obj}}

function clone(obj) {return JSON.parse(JSON.stringify(obj))}

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

var el = document.getElementById.bind(document)
// var qs = document.querySelectorAll.bind(document)

var el_graph = el('graph')
var el_nodes = el('nodes_ta')
var el_edges = el('edges_ta')
var el_save = el('save')

el_save.addEventListener('click', save_button)

function save_button() {
  var nodes_text = el_nodes.value
  var edges_text = el_edges.value
  G = Dagoba.graph(JSON.parse(nodes_text), JSON.parse(edges_text))
  Dagoba.persist(G, 'ripplemap')

  init()

  // TODO: make renderers accept a graph
  // TODO: add new node structure for data model
}

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
    var graph = new Springy.Graph();
    graph.loadJSON(graphJSON);

    var springy = jQuery('#springydemo').springy({
          graph: graph,
          damping: 0.1
        });
  });
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
  // shouldn't need this fix it blargh
  new_nodes[0] = {name: '___'}
  new_nodes[2] = {name: '___'}
  new_nodes[52] = {name: '___'}
  new_nodes[53] = {name: '___'}

  graph_it([new_nodes, edges.map(cp_prop('_in', 'source')).map(cp_prop('_out', 'target')) ])
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

var RM = {}

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
  // add an alias to anything
  var catcat = RM.cats[cat]
  if(!catcat)
    return err('Invalid cat', cat)

  var cattype = catcat[type]
  if(!cattype)
    return err('That is not a valid thing type', type)

  // add alias
  cattype.aliases.push(alias)

  // THINK: alias rules?
}

function convert_props(props) {
  if(typeof props != 'object')
    return {}

  if(Array.isArray(props))
    return {}

  return clone(props)
}


function add_thing(name, type, props) {
  var node = convert_props(props)

  // check type against list of thing types
  var cattype = rm.cats.things[type]
  if(!cattype)
    return err('that is not a valid thing type', type)

  // check props again the thing's type's property list

  // todo: check name
  node.name = name
  node.type = type

  node.priority = 1 // bbq???

  // publish in dagoba + persist
  publish('node', node)
}

function add_action(type, props) {
  var node = {}

  // check type against list of action types
  // check props against type
  // publish in dagoba + persist
  publish('node', node)
}

function add_effect(type, props) {
  var node = {}

  // check type against list of effect types
  // check props against type
  // publish in dagoba + persist
  publish('node', node)
}

function add_happening(type, props) {
  var node = {}

  // check type against list of happening types
  // check props
  // publish in dagoba + persist
  publish('node', node)
}

function add_edge(type, from, to, props) {
  var edge = {}

  // check from and to
  // check type against from and to interfaces
  // publish in dagoba + persist
  publish('edge', edge)
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

  // add properties.cc
  cattype.cc = properties.cc || {}

  // add properties.aliases
  cattype.aliases = properties.aliases || {}

  // add default props for all things
  cattype.props = {} // THINK: get props from properties.props?
  cattype.props.name = {}
  cattype.props.start = {} // THINK: these have both fuzziness and confidence issues (how sure is the user of the time, how sure are we of the user)
  cattype.props.end = {}

  // TODO: add questions

  // put in place
  RM.cats.things[type] = cattype
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

  // add properties.aliases
  cattype.aliases = properties.aliases || {}

  // add properties.edges and default edges
  cattype.edges = properties.edges || {}
  cattype.edges.did = {dir: 'in',  plural: 0, label: 'did', types: ['person'], aliases: []}
  cattype.edges.to  = {dir: 'in',  plural: 0, label: 'to',  types: ['effect'], aliases: []}
  cattype.edges.the = {dir: 'out', plural: 0, label: 'the', types: ['thing'],  aliases: []}

  // add default props for all actions
  cattype.props = {} // THINK: get props from properties.props?

  // TODO: add questions

  // put in place
  RM.cats.actions[type] = cattype
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

  // add properties.aliases
  cattype.aliases = properties.aliases || {}

  // add properties.edges and default edges
  cattype.edges = properties.edges || {}
  cattype.edges.to     = {dir: 'out', plural: 0, label: 'to',     types: ['action'],    aliases: []}
  cattype.edges.by     = {dir: 'in',  plural: 1, label: 'by',     types: ['thing'],     aliases: []}
  cattype.edges.was    = {dir: 'in',  plural: 1, label: 'was',    types: ['person'],    aliases: []}
  cattype.edges.during = {dir: 'out', plural: 0, label: 'during', types: ['happening'], aliases: []}

  // add default props for all effects
  cattype.props = {} // THINK: get props from properties.props?

  // TODO: add questions

  // put in place
  RM.cats.effects[type] = cattype
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

  // add properties.aliases
  cattype.aliases = properties.aliases || {}

  // add properties.edges and default edges
  cattype.edges = properties.edges || {}
  cattype.edges.at     = {dir: 'out', plural: 0, label: 'at',     types: ['place',   'event'], aliases: []}
  cattype.edges.the    = {dir: 'out', plural: 1, label: 'the',    types: ['outcome', 'event'], aliases: []}
  cattype.edges.did    = {dir: 'in',  plural: 1, label: 'did',    types: ['person'],           aliases: []}
  cattype.edges.during = {dir: 'in',  plural: 0, label: 'during', types: ['effect'],           aliases: []}

  // add default props for all happenings
  cattype.props = {} // THINK: get props from properties.props?

  // TODO: add questions

  // put in place
  RM.cats.happenings[type] = cattype
}

function new_edge_type(type, properties) {
  // what properties do edges have?
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

new_action_type('join',      {aliases: []})
new_action_type('leave',     {aliases: []})
new_action_type('create',    {aliases: []})
new_action_type('manage',    {aliases: ['run']})
new_action_type('assist',    {aliases: ['help']})
new_action_type('represent', {aliases: []})

new_effect_type('inspire',   {aliases: ['influenced']})
new_effect_type('convince',  {aliases: ['ask']})
new_effect_type('introduce', {aliases: ['meet']})

new_happening_type('conversation', {})
new_happening_type('experience',   {aliases: ['see', 'hear', 'watch', 'attend']})

// ADD SOME ITEMS


// INIT

function init() {
  var graph = build_graph()
  // show_graph(graph)
  // springy_it(graph)
  // webcola_it(graph)
}

init()
