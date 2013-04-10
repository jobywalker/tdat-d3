var
    // m = [10, 20, 10, 20],
    // w = 2280 - m[1] - m[3],
    // h = 800 - m[0] - m[2],
    margin = {top: 10, right: 10, left: 10, bottom: 10},
    fullWidth = 1300,
    fullHeight = 800,
    width = fullWidth - margin.left - margin.right,
    height = fullHeight - margin.top - margin.bottom,
    halfWidth = width/2,
    halfHeight = height/2,
    i = 0,
    root, t1, t2;

var tree = d3.layout.tree()
    .size([height, width])
    //.separation(function(a,b){return 750;})
    ;

var getChildren = function(d){
      var a = [];
      if(d.dependOn) for(var i = 0; i < d.dependOn.length; i++){
        d.dependOn[i].isLeft = false;
        d.dependOn[i].parent = d;
        a.push(d.dependOn[i]);
      }
      if(d.dependBy) for(var j = 0; j < d.dependBy.length; j++){
        d.dependBy[j].isLeft = true;
        d.dependBy[j].parent = d;
        a.push(d.dependBy[j]);
      }
      return a.length?a:null;
    }
    ;

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select("#tdat").append("svg:svg")
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .append("svg:g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("ssgdb.json", function(json) {
  root = json;

  rebuildStructure();


  function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }

  // Initialize the display to show a few nodes.
  //root.children.forEach(toggleAll);
  //toggle(root.children[1]);
  //toggle(root.children[1].children[2]);
  //toggle(root.children[9]);
  //toggle(root.children[9].children[0]);

  update(root);
});

var toArray = function(item, arr){
  arr = arr || [];
  var i = 0, l = item.children?item.children.length:0;
  arr.push(item);
  for(; i < l; i++){
    toArray(item.children[i], arr);
  }
  return arr;
};

function update(source) {
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  //var nodes = tree.nodes(root);//.reverse();
  var nodes = toArray(root);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y =  d.isLeft ? halfWidth - (d.depth * 150) : d.depth * 150 + halfWidth; });

  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", toggle);

  nodeEnter.append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("svg:text")
      //.attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      //.attr("x", function(d) {return 10;})
      //.attr("dy", ".35em")
      //.attr("dy", function(d) { return d.isRight?14:-8;})
      .attr("dy", -8)
      .attr("text-anchor", "middle")
      //.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      //.attr("text-anchor", function(d) { return "start"; })
      .text(function(d) { return d.short ? d.short : d.name; })
      //.text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

//node.append("text")
//    .attr("dy", "2em")
//    .text(function(d) { return d.href });


  node.append("foreignObject")
      .attr("x", -45)
      .attr("y", 10)
      .attr("width", 90)
      .attr("height", 50)
    .append("xhtml:body")
      .style("font", "11px 'Helvetica Neue'")
      .style("padding", "0")
      //.html("<h3>More Text</h3><p>More info</p>");
      .html(function(d) {
          return '<div style="border:1px solid #DDD;background-color:#FFF;padding:2px;">' +
            d.system_type + '<br/>' +
            d.criticality_classification + '/' + d.effective_redundancy + '<br/>' +
            // '<a href="https://barista.cac.washington.edu/tdat/'+ d.name + '">center</a></div>' +
            '';
      });




  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
      .attr("style", function(d) {
        var dtype = d.target.deptype;
        if (dtype === "active member") {
          return "stroke:#0F0";
        }
        else if (dtype === "passive member") {
          return "stroke:#00F";
        }
        else if (dtype === "hard dependency") {
          return "stroke:#FA0";
        }
        return "";
      })
      .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        //var p = d.source||source;
        var p = source;
        var o = {x: p.x, y: p.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

var rebuildStructure = function() {
  root.x0 = halfHeight;
  root.y0 = halfWidth;

  t1 = d3.layout.tree().size([height, halfWidth]).children(function(d){return d.dependOn;}),
  t2 = d3.layout.tree().size([height, halfWidth]).children(function(d){return d.dependBy;});
  t1.nodes(root);
  t2.nodes(root);

  var rebuildChildren = function(node){
    node.children = getChildren(node);
    if(node.children) node.children.forEach(rebuildChildren);
  };
  rebuildChildren(root);
  root.isLeft = true;
}


// Toggle children.
function toggle(d) {
  d.children = null;
  if (d._children === true) {
    if (d._dependOn) {
      d.dependOn = d._dependOn;
      d._dependOn = null;
    }
    if (d._dependBy) {
      d.dependBy = d._dependBy;
      d._dependBy = null;
    }
    d._children = false;
  }
  else {
    if (d.dependOn) {
      d._dependOn = d.dependOn;
      d.dependOn = null;
      d._children = true;
    }
    if (d.dependBy) {
      d._dependBy = d.dependBy;
      d.dependBy = null;
      d._children = true;
    }
  }
  rebuildStructure();
  update(d);
}


$(function () {
    // document ready



});
