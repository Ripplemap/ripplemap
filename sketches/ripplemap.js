// VERTICES

var nodes = [ {"name":"Cayden Mak","type":"person","_id":1}
            , {"name":"Andy Gunn","type":"person","_id":4}
            , {"name":"Sasha Costanzachock","type":"person","_id":5}
            , {"name":"Nina Bianchi","type":"person","_id":6}
            , {"name":"Chance Williams","type":"person","_id":7}
            , {"name":"Amalia Daloney","type":"person","_id":8}
            , {"name":"FCC","type":"org","_id":9}
            , {"name":"Josh Breitbart","type":"person","_id":15}
            , {"name":"Hannah Sassaman","type":"person","_id":16}
            , {"name":"Alfredo Lopez","type":"person","_id":17}
            , {"name":"Emi Kane","type":"person","_id":19}
            , {"name":"Seeta Gangadharon","type":"person","_id":20}
            , {"name":"Sarah Morris","type":"person","_id":25}
            , {"name":"Mary Alice Crim","type":"person","_id":30}
            , {"name":"Liza Dichter","type":"person","_id":32}
            , {"name":"Joe Torres","type":"person","_id":34}
            , {"name":"Danielle Chynoweth","type":"person","_id":35}
            , {"name":"Steven Renderos","type":"person","_id":54}
            , {"name":"AMC","type":"org","_id":3}
            , {"name":"US Circuit Court","type":"org","_id":11}
            , {"name":"Legacy Civil Rights Groups","type":"org","_id":12}
            , {"name":"18MR","type":"org","_id":18}
            , {"name":"Free Press","type":"org","_id":33}
            , {"name":"OTI","type":"org","_id":36}
            , {"name":"Media Mobilizing Project","type":"org","_id":37}
            , {"name":"Magnet","type":"org","_id":38}
            , {"name":"DDJC","type":"org","_id":39}
            , {"name":"CMJ","type":"org","_id":40}
            , {"name":"18 MR","type":"org","_id":46}
            , {"name":"OSF","type":"org","_id":47}
            , {"name":"Open Internet Order","type":"event","_id":10}
            , {"name":"Games Track","type":"event","_id":13}
            , {"name":"Coordinators retreat","type":"event","_id":14}
            , {"name":"Section 706 V Title 2","type":"event","_id":21}
            , {"name":"brought to org - another Asian American voice","type":"event","_id":22}
            , {"name":"Media Rights Track","type":"event","_id":23}
            , {"name":"Blogging from prison workshop in webmaking track","type":"event","_id":24}
            , {"name":"2 or 3 open internet princples","type":"event","_id":26}
            , {"name":"How to make policy concepts session","type":"event","_id":27}
            , {"name":"Securities surveillance track","type":"event","_id":28}
            , {"name":"POC Deligation","type":"event","_id":29}
            , {"name":"Title 2","type":"event","_id":31}
            , {"name":"Mobile Justice: The Next Frontier.","type":"event","_id":41}
            , {"name":"Visioning Our Media Policy Future","type":"event","_id":42}
            , {"name":"Coordinators Retreat","type":"event","_id":43}
            , {"name":"Racial Justice and Surveilance Natwork Gathering","type":"event","_id":44}
            , {"name":"Town Hall","type":"event","_id":45}
            , {"name":"Racial Justice & Surveillance network gathering","type":"event","_id":48}
            , {"name":"breifing on Capitol Hill","type":"event","_id":49}
            , {"name":"hearing for FTC","type":"event","_id":50}
            , {"name":"Internet Slowdown Day","type":"event","_id":51}
            , {"name":"a track?","type":"event","_id":55}
            , {"name":"Panel on Net Neutrality & racial Justice","type":"event","_id":56}
            , {"name":"Net Neutrality & Social Movements History","type":"event","_id":57}
            , {"name":"free & open communities","type":"event","_id":58}
            ]

// EDGES

var edges = [ {"_in":1,"_out":58,"verb":"involved in","year":"2008","month":""}
            , {"_in":1,"_out":3,"verb":"attended","year":"2010","month":""}
            , {"_in":1,"_out":4,"verb":"connected","year":"2010","month":""}
            , {"_in":1,"_out":5,"verb":"met","year":"2010","month":""}
            , {"_in":1,"_out":6,"verb":"talked with","year":"2010","month":"June"}
            , {"_in":1,"_out":4,"verb":"talked with","year":"2010","month":"June"}
            , {"_in":1,"_out":7,"verb":"talked with","year":"2010","month":"June"}
            , {"_in":1,"_out":8,"verb":"talked with","year":"2010","month":"June"}
            , {"_in":9,"_out":10,"verb":"creates","year":"2010","month":"December"}
            , {"_in":9,"_out":11,"verb":"verbs","year":"2010","month":"December"}
            , {"_in":9,"_out":12,"verb":"verbs","year":"2010","month":"December"}
            , {"_in":9,"_out":1,"verb":"verbs","year":"2010","month":"December"}
            , {"_in":1,"_out":13,"verb":"coordinates","year":"2011","month":""}
            , {"_in":1,"_out":14,"verb":"attended","year":"2011","month":""}
            , {"_in":1,"_out":7,"verb":"connected","year":"2011","month":""}
            , {"_in":1,"_out":6,"verb":"connected","year":"2011","month":""}
            , {"_in":1,"_out":15,"verb":"met","year":"2011","month":""}
            , {"_in":1,"_out":16,"verb":"met","year":"2011","month":""}
            , {"_in":1,"_out":6,"verb":"met","year":"2011","month":""}
            , {"_in":1,"_out":17,"verb":"met","year":"2011","month":""}
            , {"_in":1,"_out":18,"verb":"co-founded","year":"2012","month":""}
            , {"_in":1,"_out":3,"verb":"carried","year":"2012","month":""}
            , {"_in":18,"_out":3,"verb":"appeared at","year":"2013","month":""}
            , {"_in":1,"_out":19,"verb":"met","year":"2013","month":""}
            , {"_in":1,"_out":20,"verb":"met","year":"2013","month":""}
            , {"_in":12,"_out":21,"verb":"","year":"2013","month":""}
            , {"_in":18,"_out":22,"verb":"","year":"2013","month":""}
            , {"_in":1,"_out":23,"verb":"attends","year":"2013","month":""}
            , {"_in":1,"_out":24,"verb":"needs verb: attended, started?","year":"2013","month":""}
            , {"_in":1,"_out":25,"verb":"met","year":"2014","month":""}
            , {"_in":11,"_out":26,"verb":"vacates","year":"2014","month":"January"}
            , {"_in":25,"_out":27,"verb":"leads?","year":"2014","month":""}
            , {"_in":1,"_out":28,"verb":"needs verb: attended, started?","year":"2014","month":""}
            , {"_in":1,"_out":29,"verb":"attends","year":"2014","month":"November"}
            , {"_in":1,"_out":30,"verb":"co-presented","year":"2015","month":""}
            , {"_in":9,"_out":31,"verb":"approves","year":"2015","month":"Februrary"}
            , {"_in":1,"_out":30,"verb":"met","year":"?","month":""}
            , {"_in":1,"_out":32,"verb":"met","year":"?","month":""}
            , {"_in":1,"_out":8,"verb":"met","year":"?","month":""}
            , {"_in":1,"_out":4,"verb":"met","year":"2010","month":""}
            , {"_in":7,"_out":33,"verb":"works at","year":"2010","month":""}
            , {"_in":1,"_out":7,"verb":"met","year":"2010","month":""}
            , {"_in":1,"_out":34,"verb":"met","year":"2012","month":""}
            , {"_in":1,"_out":35,"verb":"met","year":"2013","month":""}
            , {"_in":15,"_out":36,"verb":"works at","year":"","month":""}
            , {"_in":16,"_out":37,"verb":"works at","year":"","month":""}
            , {"_in":34,"_out":33,"verb":"works at","year":"","month":""}
            , {"_in":35,"_out":38,"verb":"works at","year":"","month":""}
            , {"_in":6,"_out":39,"verb":"works at","year":"","month":""}
            , {"_in":4,"_out":36,"verb":"works at","year":"","month":""}
            , {"_in":8,"_out":40,"verb":"works at","year":"","month":""}
            , {"_in":25,"_out":36,"verb":"works at","year":"","month":""}
            , {"_in":1,"_out":14,"verb":"attended","year":2012,"month":"January"}
            , {"_in":1,"_out":7,"verb":"met","year":2010,"month":""}
            , {"_in":7,"_out":41,"verb":"led","year":2012,"month":"June"}
            , {"_in":1,"_out":42,"verb":"attended","year":2012,"month":"June"}
            , {"_in":1,"_out":7,"verb":"","year":2013,"month":"June"}
            , {"_in":1,"_out":43,"verb":"attended","year":2014,"month":"January"}
            , {"_in":7,"_out":44,"verb":"led?","year":2014,"month":"June"}
            , {"_in":7,"_out":45,"verb":"hosted","year":2015,"month":"January"}
            , {"_in":1,"_out":46,"verb":"worked","year":2014,"month":"December"}
            , {"_in":7,"_out":47,"verb":"moved to","year":2015,"month":"June"}
            , {"_in":1,"_out":7,"verb":"phoned","year":2015,"month":"March"}
            , {"_in":1,"_out":34,"verb":"met","year":2014,"month":"January"}
            , {"_in":1,"_out":14,"verb":"attended","year":2014,"month":"January"}
            , {"_in":34,"_out":14,"verb":"attended","year":2014,"month":"January"}
            , {"_in":34,"_out":48,"verb":"coordinated","year":2014,"month":"June"}
            , {"_in":1,"_out":49,"verb":"spoke at","year":2015,"month":"Feb"}
            , {"_in":34,"_out":49,"verb":"hosted","year":2015,"month":"Feb"}
            , {"_in":1,"_out":50,"verb":"spoke at","year":2014,"month":"October"}
            , {"_in":34,"_out":50,"verb":"organized","year":2014,"month":"October"}
            , {"_in":1,"_out":51,"verb":"organized","year":2014,"month":"Sept"}
            , {"_in":34,"_out":51,"verb":"found funding","year":2014,"month":"Sept"}
            , {"_in":1,"_out":54,"verb":"met","year":2013,"month":"June"}
            , {"_in":54,"_out":55,"verb":"coordinated","year":2014,"month":"June"}
            , {"_in":1,"_out":56,"verb":"spoke at","year":2015,"month":"April"}
            , {"_in":54,"_out":56,"verb":"spoke at","year":2015,"month":"April"}
            , {"_in":1,"_out":57,"verb":"coordinated","year":2015,"month":"June"}
            , {"_in":16,"_out":57,"verb":"coordinated","year":2015,"month":"June"}
            , {"_in":30,"_out":57,"verb":"coordinated","year":2015,"month":"June"}
            , {"_in":54,"_out":57,"verb":"coordinated","year":2015,"month":"June"}
            , {"_in":54,"_out":50,"verb":"organized","year":2014,"month":"October"}
            , {"_in":54,"_out":49,"verb":"spoke at","year":2014,"month":"Feb"}]


// GRAPH

var G
function build_graph() {
  G = Dagoba.depersist('ripplemap')

  if(G) return G

  G = Dagoba.graph()

  G.addVertices(clone(nodes))

  G.addEdges(clone(edges))

  return G
}


// HELPERS

function prop (attr) {return function(obj) {return obj[attr]}}

function eq(attr, val) {return function(obj) {return obj[attr] == val}}

function unique(v, k, list) {return list.indexOf(v) == k}

function strip(attr) {return function(obj) { delete obj[attr]; return obj }}

function cp_prop(from_attr, to_attr) {return function(obj) {obj[to_attr] = obj[from_attr]; return obj}}

function comp(f, g) {return function() { var args = [].slice.call(arguments); return f(g.apply(null, args)) }}

function clone(obj) {return JSON.parse(JSON.stringify(obj))}

// SHOW IT

var el = document.getElementById.bind(document)
var qs = document.querySelectorAll.bind(document)

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
  var graphJSON = {nodes: nodes.map(prop('_id')), edges: edges.map(function(edge) {return [edge._in, edge._out]})}

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
  var node_count = 60
  var new_nodes = Array(node_count)
  nodes.forEach(function(node) {
    new_nodes[node['_id']] = node
  })
  for(var i = 0; i < node_count; i++) {
    if(!new_nodes[i]) new_nodes[i] = {name: '___'}
  }

  // d3.text("/~dann/vendor/WebCola/WebCola/examples/ripplemap.json", function(f) {graph_it(parse_it(f))})
  graph_it([new_nodes, edges.map(cp_prop('_in', 'source')).map(cp_prop('_out', 'target')), []])
}

// EDIT IT


// INIT

function init() {
  var graph = build_graph()
  show_graph(graph)
  springy_it(graph)
  webcola_it(graph)
}

init()
