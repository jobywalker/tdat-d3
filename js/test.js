var data = {
    "name": "ssgdb",
    "href": "http://example.com",
    "children": [
        {
            "name": "ssgdb03.cac.washington.edu",
            "href": "http://example.com"
        },
        {
            "name": "ssgdb04.cac.washington.edu",
            "href": "http://example.com"
        }
    ]
};

 var width = 1000,
      height = 1000;
 
 var cluster = d3.layout.cluster()
      .size([height, width - 160]);
 
  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]; });
 
 var vis = d3.select("#chart").append("svg")
     .attr("width", width)
     .attr("height", height);
     
   //.call(d3.behavior.zoom().on("zoom", update))
   //.append("g")
   //  .attr("transform", "translate(40, 0)");
 
   var nodes = cluster.nodes(data);
 
   var link = vis.selectAll("path.link")
       .data(cluster.links(nodes))
     .enter().append("path")
       .attr("class", "link")
       .attr("d", diagonal);
 
   var node = vis.selectAll("g.node")
       .data(nodes)
     .enter().append("g")
      .attr("class", "node")
       .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
 
   node.append("circle")
       .attr("r", 10.5);
 
   node.append("text")
       .attr("text-anchor", "middle")
       //.attr("dx", function(d) { return d.children ? -8 : 8; })
       //.attr("dy", 3)
       //.attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
       .text(function(d) { return d.name; });

function update() {
    vis.attr("transform"," scale(" + d3.event.scale + ")");
}

