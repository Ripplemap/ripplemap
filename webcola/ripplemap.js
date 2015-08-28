hljs.initHighlightingOnLoad();
var d3cola = cola.d3adaptor().convergenceThreshold(0.1);

var width = 960, height = 700;

var outer = d3.select("body").append("svg")
      .attr({ width: width, height: height, "pointer-events": "all" });

outer.append('rect')
  .attr({ class: 'background', width: "100%", height: "100%" })
  .call(d3.behavior.zoom().on("zoom", redraw));

var vis = outer
      .append('g')
      .attr('transform', 'translate(250,250) scale(0.3)');

function redraw() {
  vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

outer.append('svg:defs').append('svg:marker')
  .attr({
    id: 'end-arrow',
    viewBox: '0 -5 10 10',
    refX: 8,
    markerWidth: 6,
    markerHeight: 6,
    orient: 'auto'
  })
  .append('svg:path')
  .attr({
    d: 'M0,-5L10,0L0,5L2,0',
    'stroke-width': '0px',
    fill: '#000'});

d3.text("ripplemap.json", function (f) {
  var digraph = JSON.parse(f)
  var graph = digraph.primary.concat(digraph.extended)

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

  d3cola
    .avoidOverlaps(true)
    // .convergenceThreshold(0.1)
    .flowLayout('x', 350)
    .size([width, height])
    .nodes(nodes)
    .links(edges)
    .groups(groups)
    // .jaccardLinkLengths(250)

  var link = vis.selectAll(".link")
        .data(edges)
        .enter().append("path")
        .attr("class", "link");

  var margin = 10, pad = 12;
  var node = vis.selectAll(".node")
        .data(nodes)
        .enter().append("rect")
        .classed("node", true)
        .attr({ rx: 5, ry: 5 })
        .call(d3cola.drag);

  var label = vis.selectAll(".label")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .text(function (d) { return d.name; })
        .call(d3cola.drag)
        .each(function (d) {
          var b = this.getBBox();
          var extra = 2 * margin + 2 * pad;
          d.width = b.width + extra;
          d.height = b.height + extra;
        });

  var lineFunction = d3.svg.line()
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; })
        .interpolate("linear");

  var routeEdges = function () {
        d3cola.prepareEdgeRouting();
        link.attr("d", function (d) {
          return lineFunction(d3cola.routeEdge(d
                                               // show visibility graph
                                               //, function (g) {
                                               //    if (d.source.id === 10 && d.target.id === 11) {
                                               //    g.E.forEach(function (e) {
                                               //        vis.append("line").attr("x1", e.source.p.x).attr("y1", e.source.p.y)
                                               //            .attr("x2", e.target.p.x).attr("y2", e.target.p.y)
                                               //            .attr("stroke", "green");
                                               //    });
                                               //    }
                                               //}
                                              ));
        });
        if (isIE()) link.each(function (d) { this.parentNode.insertBefore(this, this) });
      }
  d3cola.start(50, 100, 200).on("tick", function () {
    node.each(function (d) { d.innerBounds = d.bounds.inflate(-margin); })
      .attr("x", function (d) { return d.innerBounds.x; })
      .attr("y", function (d) { return d.innerBounds.y; })
      .attr("width", function (d) {
        return d.innerBounds.width();
      })
      .attr("height", function (d) { return d.innerBounds.height(); });

    link.attr("d", function (d) {
      cola.vpsc.makeEdgeBetween(d, d.source.innerBounds, d.target.innerBounds, 5);
      var lineData = [{ x: d.sourceIntersection.x, y: d.sourceIntersection.y }, { x: d.arrowStart.x, y: d.arrowStart.y }];
      return lineFunction(lineData);
    });
    if (isIE()) link.each(function (d) { this.parentNode.insertBefore(this, this) });

    label
      .attr("x", function (d) { return d.x })
      .attr("y", function (d) { return d.y + (margin + pad) / 2 });

  }).on("end", routeEdges);
});
function isIE() { return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null))); }


    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"Fight for the Future","event":"","other":null},
    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"Demand Progress","event":"","other":null},
    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"Color of Change","event":"","other":null},
    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"Presente.org","event":"","other":null},
    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"National Hispanic Media Coalition","event":"","other":null},
    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"Tumblr","event":"","other":null},
    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"Etsy","event":"","other":null},
    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"Google","event":"","other":null},
    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"Facebook","event":"","other":null},
    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"John Oliver/HBO","event":"","other":null},
    // {"month":null,"year":"","person":"","verb":"","person2":"","organization":"EFF","event":"","other":null}
