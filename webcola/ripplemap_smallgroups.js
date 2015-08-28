var width = 960
var height = 800

var color = d3.scale.category20();

var cola = cola .d3adaptor()
                .linkDistance(200)
                // .flowLayout('x', 250)
                .avoidOverlaps(true)
                // .handleDisconnected(false)
                .size([width, height]);

var svg = d3 .select("body")
             .append("svg")
             .attr("width", width)
             .attr("height", height);

d3.json("ripplemap.json", function (error, graph) {

  graph = graph.primary.concat(graph.extended)

  var nodeNames = {}
  var nodes = []
  var edges = []
  var groups = {}

  graph.forEach(function(node) {
    addNode(node.person, 'person')

    var other = {people: node.person2, org: node.organization, event: node.event, other: node.other}
    var other_id = addNode(other)

    var edge = {month: node.month, year: node.year, verb: node.verb}

    addEdge(node.person, other_id, edge)
  })

  function addNode(thing, type) {
    var id = '' + thing

    if(typeof thing == 'object') {
      if(thing.people) {
        id = thing.people
        type = 'person'
      }
      else if(thing.event) {
        id = thing.event
        type = 'event'
      }
      else if(thing.org) {
        id = thing.org
        type = 'org'
      }
      else {
        id = Object.keys(thing).reduce(function(acc, prop) { return acc + (thing[prop] ? prop + ": " + thing[prop] + " " : '') }, '')
        type = 'other'
      }
    }

    if(!id) return false

    if(nodeNames[id]) return nodeNames[id]

    var node = {id: id, name: id, type: type, index: nodes.length}

    if(typeof thing == 'object') {
      // TODO: use Object.create
      Object.keys(thing).forEach(function(prop) { node[prop] = thing[prop] })
    }

    nodeNames[id] = node
    nodes.push(node)

    return node
  }

  function addEdge(from_id, to_id, props) {
    var from = nodeNames[from_id] || nodeNames[from_id.id]
    var to   = nodeNames[to_id]   || nodeNames[to_id.id]

    if(!from || !to) return false

    var edge = {source: from, target: to}
    if(typeof props == 'object') {
      // TODO: use Object.create
      Object.keys(props).forEach(function(prop) { edge[prop] = props[prop] })
    }

    edges.push(edge)

    return edge
  }

  // groups, leaves, padding, style...
  groups = nodes.reduce(function(acc, node) {
    acc[node.type] = acc[node.type] ? acc[node.type].concat(node.index) : [node.index]; return acc }, {} )
  groups = Object.keys(groups).map(function(prop) { return {leaves: groups[prop]} })



  nodes = [{"name":"Cayden Mak","type":"person","_id":1},{"name":"Andy Gunn","type":"person","_id":4},{"name":"Sasha Costanzachock","type":"person","_id":5},{"name":"Nina Bianchi","type":"person","_id":6},{"name":"Chance Williams","type":"person","_id":7},{"name":"Amalia Daloney","type":"person","_id":8},{"name":"FCC","type":"org","_id":9},{"name":"Josh Breitbart","type":"person","_id":15},{"name":"Hannah Sassaman","type":"person","_id":16},{"name":"Alfredo Lopez","type":"person","_id":17},{"name":"Emi Kane","type":"person","_id":19},{"name":"Seeta Gangadharon","type":"person","_id":20},{"name":"Sarah Morris","type":"person","_id":25},{"name":"Mary Alice Crim","type":"person","_id":30},{"name":"Liza Dichter","type":"person","_id":32},{"name":"Joe Torres","type":"person","_id":34},{"name":"Danielle Chynoweth","type":"person","_id":35},{"name":"Steven Renderos","type":"person","_id":54},{"name":"AMC","type":"org","_id":3},{"name":"US Circuit Court","type":"org","_id":11},{"name":"Legacy Civil Rights Groups","type":"org","_id":12},{"name":"18MR","type":"org","_id":18},{"name":"Free Press","type":"org","_id":33},{"name":"OTI","type":"org","_id":36},{"name":"Media Mobilizing Project","type":"org","_id":37},{"name":"Magnet","type":"org","_id":38},{"name":"DDJC","type":"org","_id":39},{"name":"CMJ","type":"org","_id":40},{"name":"18 MR","type":"org","_id":46},{"name":"OSF","type":"org","_id":47},{"name":"Open Internet Order","type":"event","_id":10},{"name":"Games Track","type":"event","_id":13},{"name":"Coordinators retreat","type":"event","_id":14},{"name":"Section 706 V Title 2","type":"event","_id":21},{"name":"brought to org - another Asian American voice","type":"event","_id":22},{"name":"Media Rights Track","type":"event","_id":23},{"name":"Blogging from prison workshop in webmaking track","type":"event","_id":24},{"name":"2 or 3 open internet princples","type":"event","_id":26},{"name":"How to make policy concepts session","type":"event","_id":27},{"name":"Securities surveillance track","type":"event","_id":28},{"name":"POC Deligation","type":"event","_id":29},{"name":"Title 2","type":"event","_id":31},{"name":"Mobile Justice: The Next Frontier.","type":"event","_id":41},{"name":"Visioning Our Media Policy Future","type":"event","_id":42},{"name":"Coordinators Retreat","type":"event","_id":43},{"name":"Racial Justice and Surveilance Natwork Gathering","type":"event","_id":44},{"name":"Town Hall","type":"event","_id":45},{"name":"Racial Justice & Surveillance network gathering","type":"event","_id":48},{"name":"breifing on Capitol Hill","type":"event","_id":49},{"name":"hearing for FTC","type":"event","_id":50},{"name":"Internet Slowdown Day","type":"event","_id":51},{"name":"a track?","type":"event","_id":55},{"name":"Panel on Net Neutrality & racial Justice","type":"event","_id":56},{"name":"Net Neutrality & Social Movements History","type":"event","_id":57},
           {"name":"Steven Renderos","type":"person","_id":53},{"name":"Steven Renderos","type":"person","_id":60},{"name":"Steven Renderos","type":"person","_id":61}, {"name":"Steven Renderos","type":"person","_id":64}]

edges = [{"_in":1,"_out":1,"verb":"involved","year":"2008","month":""},{"_in":1,"_out":3,"verb":"attended","year":"2010","month":""},{"_in":1,"_out":4,"verb":"connected","year":"2010","month":""},{"_in":1,"_out":5,"verb":"met","year":"2010","month":""},{"_in":1,"_out":6,"verb":"talked with","year":"2010","month":"June"},{"_in":1,"_out":4,"verb":"talked with","year":"2010","month":"June"},{"_in":1,"_out":7,"verb":"talked with","year":"2010","month":"June"},{"_in":1,"_out":8,"verb":"talked with","year":"2010","month":"June"},{"_in":9,"_out":10,"verb":"creates","year":"2010","month":"December"},{"_in":9,"_out":11,"verb":"verbs","year":"2010","month":"December"},{"_in":9,"_out":12,"verb":"verbs","year":"2010","month":"December"},{"_in":9,"_out":1,"verb":"verbs","year":"2010","month":"December"},{"_in":1,"_out":13,"verb":"coordinates","year":"2011","month":""},{"_in":1,"_out":14,"verb":"attended","year":"2011","month":""},{"_in":1,"_out":7,"verb":"connected","year":"2011","month":""},{"_in":1,"_out":6,"verb":"connected","year":"2011","month":""},{"_in":1,"_out":15,"verb":"met","year":"2011","month":""},{"_in":1,"_out":16,"verb":"met","year":"2011","month":""},{"_in":1,"_out":6,"verb":"met","year":"2011","month":""},{"_in":1,"_out":17,"verb":"met","year":"2011","month":""},{"_in":1,"_out":18,"verb":"co-founded","year":"2012","month":""},{"_in":1,"_out":3,"verb":"carried","year":"2012","month":""},{"_in":18,"_out":3,"verb":"appeared at","year":"2013","month":""},{"_in":1,"_out":19,"verb":"met","year":"2013","month":""},{"_in":1,"_out":20,"verb":"met","year":"2013","month":""},{"_in":12,"_out":21,"verb":"","year":"2013","month":""},{"_in":18,"_out":22,"verb":"","year":"2013","month":""},{"_in":1,"_out":23,"verb":"attends","year":"2013","month":""},{"_in":1,"_out":24,"verb":"needs verb: attended, started?","year":"2013","month":""},{"_in":1,"_out":25,"verb":"met","year":"2014","month":""},{"_in":11,"_out":26,"verb":"vacates","year":"2014","month":"January"},{"_in":25,"_out":27,"verb":"leads?","year":"2014","month":""},{"_in":1,"_out":28,"verb":"needs verb: attended, started?","year":"2014","month":""},{"_in":1,"_out":29,"verb":"attends","year":"2014","month":"November"},{"_in":1,"_out":30,"verb":"co-presented","year":"2015","month":""},{"_in":9,"_out":31,"verb":"approves","year":"2015","month":"Februrary"},{"_in":1,"_out":30,"verb":"met","year":"?","month":""},{"_in":1,"_out":32,"verb":"met","year":"?","month":""},{"_in":1,"_out":8,"verb":"met","year":"?","month":""},{"_in":1,"_out":4,"verb":"met","year":"2010","month":""},{"_in":7,"_out":33,"verb":"works at","year":"2010","month":""},{"_in":1,"_out":7,"verb":"met","year":"2010","month":""},{"_in":1,"_out":34,"verb":"met","year":"2012","month":""},{"_in":1,"_out":35,"verb":"met","year":"2013","month":""},{"_in":15,"_out":36,"verb":"works at","year":"","month":""},{"_in":16,"_out":37,"verb":"works at","year":"","month":""},{"_in":34,"_out":33,"verb":"works at","year":"","month":""},{"_in":35,"_out":38,"verb":"works at","year":"","month":""},{"_in":6,"_out":39,"verb":"works at","year":"","month":""},{"_in":4,"_out":36,"verb":"works at","year":"","month":""},{"_in":8,"_out":40,"verb":"works at","year":"","month":""},{"_in":25,"_out":36,"verb":"works at","year":"","month":""},{"_in":1,"_out":14,"verb":"attended","year":2012,"month":"January"},{"_in":1,"_out":7,"verb":"met","year":2010,"month":""},{"_in":7,"_out":41,"verb":"led","year":2012,"month":"June"},{"_in":1,"_out":42,"verb":"attended","year":2012,"month":"June"},{"_in":1,"_out":7,"verb":"","year":2013,"month":"June"},{"_in":1,"_out":43,"verb":"attended","year":2014,"month":"January"},{"_in":7,"_out":44,"verb":"led?","year":2014,"month":"June"},{"_in":7,"_out":45,"verb":"hosted","year":2015,"month":"January"},{"_in":1,"_out":46,"verb":"worked","year":2014,"month":"December"},{"_in":7,"_out":47,"verb":"moved to","year":2015,"month":"June"},{"_in":1,"_out":7,"verb":"phoned","year":2015,"month":"March"},{"_in":1,"_out":34,"verb":"met","year":2014,"month":"January"},{"_in":1,"_out":14,"verb":"attended","year":2014,"month":"January"},{"_in":34,"_out":14,"verb":"attended","year":2014,"month":"January"},{"_in":34,"_out":48,"verb":"coordinated","year":2014,"month":"June"},{"_in":1,"_out":49,"verb":"spoke at","year":2015,"month":"Feb"},{"_in":34,"_out":49,"verb":"hosted","year":2015,"month":"Feb"},{"_in":1,"_out":50,"verb":"spoke at","year":2014,"month":"October"},{"_in":34,"_out":50,"verb":"organized","year":2014,"month":"October"},{"_in":1,"_out":51,"verb":"organized","year":2014,"month":"Sept"},{"_in":34,"_out":51,"verb":"found funding","year":2014,"month":"Sept"},{"_in":1,"_out":54,"verb":"met","year":2013,"month":"June"},{"_in":54,"_out":55,"verb":"coordinated","year":2014,"month":"June"},{"_in":1,"_out":56,"verb":"spoke at","year":2015,"month":"April"},{"_in":54,"_out":56,"verb":"spoke at","year":2015,"month":"April"},{"_in":1,"_out":57,"verb":"coordinated","year":2015,"month":"June"},{"_in":16,"_out":57,"verb":"coordinated","year":2015,"month":"June"},{"_in":30,"_out":57,"verb":"coordinated","year":2015,"month":"June"},{"_in":54,"_out":57,"verb":"coordinated","year":2015,"month":"June"},{"_in":54,"_out":50,"verb":"organized","year":2014,"month":"October"},{"_in":54,"_out":49,"verb":"spoke at","year":2014,"month":"Feb"}]

  var cp_prop = function(from_attr, to_attr) {return function(obj) {obj[to_attr] = obj[from_attr]; return obj}}

  graph = {nodes: nodes
         , links: edges.map(cp_prop('_in', 'source')).map(cp_prop('_out', 'target'))
         , groups: groups}

  cola
    .nodes(graph.nodes)
    .links(graph.links)
    // .groups(graph.groups)
    .start(10,15,20);

  var group = svg.selectAll(".group")
        .data(graph.groups)
        .enter().append("rect")
        .attr("rx", 8).attr("ry", 8)
        .attr("class", "group")
        .style("fill", function (d, i) { return color(i); });

  var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link");

  var pad = 3;
  var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("rect")
        .attr("class", "node")
        .attr("width", function (d) { return d.width - 2 * pad; })
        .attr("height", function (d) { return d.height - 2 * pad; })
        .attr("rx", 5).attr("ry", 5)
        .style("fill", function (d) { return color(graph.groups.length); })
        .call(cola.drag);

  var label = svg.selectAll(".label")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "label")
        .text(function (d) { return d.name; })
        .call(cola.drag);

  node.append("title")
    .text(function (d) { return d.name; });

  cola.on("tick", function () {
    link.attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    // node.attr("x", function (d) { return d.x - d.width / 2 + pad; })
    //   .attr("y", function (d) { return d.y - d.height / 2 + pad; });

    group.attr("x", function (d) { return d.bounds.x; })
      .attr("y", function (d) { return d.bounds.y; })
      .attr("width", function (d) { return d.bounds.width(); })
      .attr("height", function (d) { return d.bounds.height(); });

    label.attr("x", function (d) { return d.x; })
      .attr("y", function (d) {
        var h = this.getBBox().height;
        return d.y + h/4;
      });
  });
});
