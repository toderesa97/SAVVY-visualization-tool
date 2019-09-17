let translateVar = [0,0];
let scaleVar = 1;
let radius = 50;
let expanded_nodes = {};
let zoom;
let undo_manager = new UndoManager();
let used_id_edges = {};
let used_id_nodes = {};

// this code is for centering the screen when searching for a node
let to_bounding_box = function(W, H, center, w, h, margin) {
    let k, kh, kw, x, y;
    kw = (W - margin) / w;
    kh = (H - margin) / h;
    k = d3.min([kw, kh]);
    x = W / 2 - center.x * k;
    y = H / 2 - center.y * k;
    return d3.zoomIdentity.translate(x, y).scale(k);
};

// this function creates the svg and adds the zoom effects
function create_pan_zoomable_svg(html_element, width, height) {
    zoom = d3.zoom()
        .on("zoom", zoomed);

    let svg = d3.select(html_element)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "svg-canvas")
        .style("background-color", "#eeeeee")
        .call(zoom).on("dblclick.zoom", null);
    let _g = svg.append("g");

    // button events for zooming in/out
    d3.select("#zoom_in").on("click", function() {
        zoom.scaleBy(svg.transition().duration(750), 1.2);
    });
    d3.select("#zoom_out").on("click", function() {
        zoom.scaleBy(svg.transition().duration(750), 0.8);
    });
    create_marker(_g);
    initialize_link_node(_g);
    this.g = _g;
    this.svg = svg;
}


function zoomed() {
    g.attr("transform", d3.event.transform);
}

function create_marker(svg) {
    let defs = svg.append("defs");

    // every node has a blur effect around it
    defs.append("filter")
        .attr("id", "blur")
        .append("feGaussianBlur")
        .attr("stdDeviation", 0);

    // creating the head of the arrow
    defs.append("marker")
        .attr("id", "arrow_e")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", function () {
            return radius-10;
        })
        .attr("refY", 0)
        .attr("fill", "#aab1b3")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    // arrow's head that appears when viceversa relationship is activated
    defs.append("marker")
        .attr("id", "arrow_s")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", function() {
            return (-1)*radius+20;
        })
        .attr("refY", 0)
        .attr("fill", "#aab1b3")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M10,-5L10,5L0,0");

}

function getScreenInfo() {
    return {
        width : ($(window).width()-translateVar[0])/scaleVar,
        height : ($(window).height()-translateVar[1])/scaleVar,
        centerx : (($(window).width()-translateVar[0])/scaleVar)/2,
        centery : (($(window).height()-translateVar[1])/scaleVar)/2
    };
}

let link_container, node_container, simulation;

function initialize_link_node(g) {
    let currentScreen = getScreenInfo();
    simulation = d3.forceSimulation()
        .force("link", d3.forceLink()
            .id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody()
            .strength(function(d) { return -20000;}))
        .force("center", d3.forceCenter(currentScreen.centerx, currentScreen.centery));

    // this is the starting point in which all the nodes and edges are going to
    // be created in
    link_container = g.append("g").selectAll(".link");
    node_container = g.append("g").selectAll(".node");
}

function is_expandable(node) {
    // a node is expandable as long as one of its neighbors,
    // at least, is not either on the canvas or visible
    let neighbors = graphManager.getGraph().getNeighbors(node);
    for (let i = 0; i < neighbors.length; i++) {
        if (! node_in_canvas(neighbors[i]) || ! is_visible(neighbors[i])) {
            return true;
        }
    }
    return false;
}

function is_visible(node) {
    return d3.select("#"+node).style("visibility") === "visible";
}

function includes_id (map, element) {
    return map[element.id] !== undefined;
    /*
    for (let i = 0; i < edges.length; i++) {
        if (edges[i].id === element_id) return true;
    }
    return false;*/
}

function get_nodes(node, nodes, filter) {
    if (expanded_nodes[node] !== undefined) return;
    if (nodes === undefined) {
        nodes = [];
    }
    let created_nodes_for_node = {};
    if (! exist_node(used_id_nodes, node)) {
        nodes.push(graphManager.getGraph().getNode(node));
        used_id_nodes[node.id] = "";
    }
    let neighbors_of_node;
    // ask whether the filterNodes object is not undefined, in such case, filtering based
    // upon the selected option (either wanted or not wanted) and the selected labels
    if (filter.filterNodes !== undefined) {
        neighbors_of_node = graphManager.getGraph().getNeighborsFiltered(node, filter.filterNodes.option, filter.filterNodes.labels);
    } else {
        neighbors_of_node = graphManager.getGraph().getNeighbors(node);
    }
    for (let neighbor_node in neighbors_of_node) {
        if (! exist_node(used_id_nodes, neighbors_of_node[neighbor_node])) {
            nodes.push(graphManager.getGraph().getNode(neighbors_of_node[neighbor_node]));
            used_id_nodes[neighbors_of_node[neighbor_node]] = "";
        }
        //created_nodes_for_node.push(neighbors_of_node[neighbor_node]);
    }

    // putting into a map the nodes that parameter node HAS created as
    // a consequence of its expansion
    expanded_nodes[node] = {};
    expanded_nodes[node]['nodes'] = created_nodes_for_node;

    // the this.nodes variable keeps track of all the current expanded nodes so far
    // on the canvas
    this.nodes = nodes;
    return nodes;
}

function exist_node(list, node) {
    // check whether a list (mostly of nodes) does contain a node
    return list[node] !== undefined;
    /*
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === node) {
            return true;
        }
    }
    return false;*/
}

function set_deexpansion_method(method) {
    this.de_expansion_method = method;
}

function node_in_canvas(node_id) {
    // way to check whether an element exists by using d3
    return d3.select("#g-"+node_id)._groups[0][0] !== null;
}

function exist_link(src, target) {
    // does not matter the direction as long as one of them is true
    // src and target are ids, meaning that it is not possible to have two different edges
    // implying such ids.
    return d3.select("#hl-"+src+"-"+target)._groups[0][0] !== null || d3.select("#hl-"+target+"-"+src)._groups[0][0] !== null;
}

function get_edges(node, edges, filter) {
    // has the same structure as get_nodes
    if (edges === undefined) {
        edges = [];
    }
    let neighbors_of_node;
    if (filter.filterNodes !== undefined) {
        neighbors_of_node = graphManager.getGraph().getNeighborsFiltered(node, filter.filterNodes.option, filter.filterNodes.labels);
    } else {
        neighbors_of_node = graphManager.getGraph().getNeighbors(node);
    }
    let created_edges_for_node = {};
    for (let neighbor_node_index in neighbors_of_node) {
        if (graphManager.getGraph().hasEdge(node, neighbors_of_node[neighbor_node_index])) {
            if (exist_link(node, neighbors_of_node[neighbor_node_index])) continue;
            let e = graphManager.getGraph().getEdge(node, neighbors_of_node[neighbor_node_index]);
            if (! includes_id(used_id_edges, e)) {
                used_id_edges[e.id] = "";
                edges.push(e);
            }
            if (! includes_id(created_edges_for_node, e)) {
                created_edges_for_node[e.id] = "";
            }
        } else {
            if (exist_link(neighbors_of_node[neighbor_node_index], node)) continue;
            let e = graphManager.getGraph().getEdge(neighbors_of_node[neighbor_node_index], node);
            if (! includes_id(used_id_edges, e)) {
                used_id_edges[e.id] = "";
                edges.push(e);
            }
            if (! includes_id(created_edges_for_node, e)) {
                created_edges_for_node[e.id] = "";
            }
        }

        // not only creating the edges that a node as a consequence of its expansion
        // generates, but the edges among all the current nodes
        let foo = get_edges_among_neighbors(neighbors_of_node[neighbor_node_index], edges);
        for (let i = 0; i < foo.length; i++) {
            if (exist_link(foo[i]["id"].split("-")[0], foo[i]["id"].split("-")[1])) continue;
            if (! includes_id(created_edges_for_node, foo[i])) {
                created_edges_for_node[foo[i].id] = "";
            }
        }
        edges = foo;
    }

    // contains THE edges created for this particular node
    expanded_nodes[node]['edges'] = created_edges_for_node;
    this.edges = edges;
    return edges;
}

function get_edges_among_neighbors(node, edges) {
    // actually this method just retrieves the edges of a node
    // but only the ones that do not exist
    let neighbors = graphManager.getGraph().getNeighbors(node);
    for (let i = 0; i < neighbors.length; i++) {
        if (! node_in_canvas(neighbors[i])) continue;
        if (graphManager.getGraph().hasEdge(node, neighbors[i])) {
            let e = graphManager.getGraph().getEdge(node, neighbors[i]);
            if (includes_id(used_id_edges, e)) continue;
            edges.push(e);
        } else {
            let e = graphManager.getGraph().getEdge(neighbors[i], node);
            if (includes_id(used_id_edges, e)) continue;
            edges.push(e);
        }
    }
    return edges;
}

function clearCanvas() {
    this.edges = [];
    this.nodes = [];
    expanded_nodes = {};
    used_id_nodes = {};
    used_id_edges = {};
    window.node_highlighted = undefined;
    d3.select("svg").remove();
    create_pan_zoomable_svg("body", "100%", "100%");
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function() {
    this.each(function() {
        this.parentNode.firstChild
        && this.parentNode.insertBefore(this, firstChild);
    });
};

function highlight_node_edges(node, isHighLighted) {
    // this method is responsible for highlighting the node and its
    // neighbors when such node is clicked
    // param isHighLighted serves as a toggle, and it is a result of
    // what is contained within the data-highlight attribute in HTML
    // element with id node (circle.node)
    let neighbors = graphManager.getGraph().getNeighbors(node);
    if (isHighLighted === null || isHighLighted === "false") {
        d3.select("#"+node).attr("data-highlight", "true");
        d3.select("#hc-"+node).attr("fill-opacity", 0.6).attr("fill", "rgb(150,150,150)");
        for (let i = 0; i < neighbors.length; i++) {
            d3.select("#hc-"+neighbors[i]).attr("fill-opacity", 0.6).attr("fill", "rgb(150,150,150)");
            d3.select("#hl-"+neighbors[i]+"-"+node).style("opacity", 0.6);
            d3.select("#hl-"+node+"-"+neighbors[i]).style("opacity", 0.6);

        }
    } else if (isHighLighted === "true") {
        d3.select("#"+node).attr("data-highlight", "false");
        d3.select("#hc-"+node).attr("fill-opacity", 0);
        for (let i = 0; i < neighbors.length; i++) {
            d3.select("#hc-"+neighbors[i]).attr("fill-opacity", 0);
            d3.select("#hl-"+neighbors[i]+"-"+node).style("opacity", 0);
            d3.select("#hl-"+node+"-"+neighbors[i]).style("opacity", 0);
        }
    }
    window.node_highlighted = node;
}

function deexpand_node(node_to_dexpand) {
    // todo: check for deleting nodes not hiding them
    let de_expansion_method = this.de_expansion_method;
    if (this.de_expansion_method === undefined) {
        de_expansion_method = "slight";
    }
    if (de_expansion_method === "slight") {
        deexpand_node_slight_method(node_to_dexpand);
    } else {
        deexpand_node_rough_method(node_to_dexpand);
    }
}

function deexpand_node_slight_method(node_to_dexpand) {
    // slight pruning removes the leaves, ie: nodes that has not further
    // connections
    let neighbor_nodes = graphManager.getGraph().getNeighbors(node_to_dexpand);
    for (let i = 0; i < neighbor_nodes.length; i++) {
        if (! has_further_connection(node_to_dexpand, neighbor_nodes[i])) {
            if (node_in_canvas(node_to_dexpand)) {
                d3.select("#ne-"+node_to_dexpand).attr("data-expandable", "true").style("visibility", "visible");
            }
            d3.select("#g-"+node_to_dexpand+"-"+neighbor_nodes[i]).style("visibility", "hidden");
            d3.select("#g-"+neighbor_nodes[i]+"-"+node_to_dexpand).style("visibility", "hidden");
            d3.select("#g-"+neighbor_nodes[i]).style("visibility", "hidden");
            if (node_in_canvas(neighbor_nodes[i]) && d3.select("#ne-"+neighbor_nodes[i]).attr("data-expandable") !== undefined) {
                d3.select("#ne-"+neighbor_nodes[i]).style("visibility", "hidden");
            }
        }
    }

    d3.select("#inv_"+node_to_dexpand)
        .on("dblclick", function(){
            spawn_nodes(graphManager.getGraph(), node_to_dexpand);
            make_deexpanded_nodes_visible_slight(node_to_dexpand);
        });

    // inserting into the undo manager the reverse operation
    undo_manager.add({
        operation : deexpand_node_slight_method,
        params : [node_to_dexpand],
        undo_f : make_deexpanded_nodes_visible_slight,
        params_undo : [node_to_dexpand]
    });
}

function deexpand_node_rough_method(node_to_dexpand) {
    let neighbor_nodes = graphManager.getGraph().getNeighbors(node_to_dexpand);
    d3.select("#g-"+node_to_dexpand).style("visibility", "hidden");
    d3.select("#ne-"+node_to_dexpand).style("visibility", "hidden");
    for (let i = 0; i < neighbor_nodes.length; i++) {
        if (! node_in_canvas(node_to_dexpand) || ! node_in_canvas(neighbor_nodes[i])) {
            continue;
        }
        d3.select("#g-"+node_to_dexpand+"-"+neighbor_nodes[i]).style("visibility", "hidden");
        d3.select("#g-"+neighbor_nodes[i]+"-"+node_to_dexpand).style("visibility", "hidden");
        if (has_further_connection(node_to_dexpand, neighbor_nodes[i])) {
            d3.select("#ne-" + neighbor_nodes[i]).style("visibility", "visible");
        } else {
            d3.select("#ne-" + neighbor_nodes[i]).style("visibility", "hidden");
        }
        if (! has_further_connection(node_to_dexpand, neighbor_nodes[i])) {
            d3.select("#g-"+neighbor_nodes[i]).style("visibility", "hidden");
        }
    }

    d3.select("#inv_"+node_to_dexpand)
        .on("dblclick", function(){
            spawn_nodes(graphManager.getGraph(), node_to_dexpand);
            make_deexpanded_nodes_visible_rough(node_to_dexpand);
        });
    undo_manager.add({
        operation : deexpand_node_rough_method,
        params : [node_to_dexpand],
        undo_f : make_deexpanded_nodes_visible_rough,
        params_undo : [node_to_dexpand]
    });
}

function has_further_connection(origin, node) {
    let neigbors = graphManager.getGraph().getNeighbors(node);
    if (neigbors.length <= 1) {
        // since origin is the node_to_dexpand and node is a neighbor,
        // if the neighbors of node are less or equal than one, that means
        // there are no further connections
        return false;
    }
    for (let i = 0; i < neigbors.length; i++) {
        if (node_in_canvas(neigbors[i]) && neigbors[i] !== origin && is_visible(neigbors[i])
            && exist_link(node, neigbors[i]) && is_link_visible(node, neigbors[i])) {
            return true;
        }
    }
    return false;
}

function is_link_visible(src, target) {
    let foo = d3.select("#g-"+src+"-"+target);
    if ( foo._groups[0][0] === null ) {
        foo = d3.select("#g-"+target+"-"+src);
    }
    return foo.style("visibility") === "visible";
}

function make_deexpanded_nodes_visible_rough(node) {
    let neighbor_nodes = graphManager.getGraph().getNeighbors(node);
    d3.select("#ne-"+node).attr("data-expandable", "false").style("visibility", "hidden");
    for (let i = 0; i < neighbor_nodes.length; i++) {
        make_edge_node_icon_visible(node, neighbor_nodes[i]);
        let neighbor_of_neighbor = graphManager.getGraph().getNeighbors(neighbor_nodes[i]);
        for (let j = 0; j < neighbor_of_neighbor.length; j++) {
            make_edge_node_icon_visible(neighbor_nodes[i], neighbor_of_neighbor[j]);
        }
    }
}

function make_deexpanded_nodes_visible_slight(node) {
    let neighbor_nodes = graphManager.getGraph().getNeighbors(node);
    d3.select("#ne-"+node).attr("data-expandable", "false").style("visibility", "hidden");
    for (let i = 0; i < neighbor_nodes.length; i++) {
        make_edge_node_icon_visible(node, neighbor_nodes[i]);
    }
}

function make_edge_node_icon_visible(node, neighbor) {
    if (! node_in_canvas(node) || ! node_in_canvas(neighbor)) return;
    d3.select("#g-"+node+"-"+neighbor).style("visibility", "visible");
    d3.select("#g-"+neighbor+"-"+node).style("visibility", "visible");
    d3.select("#g-"+neighbor).style("visibility", "visible");
    if (is_expandable(neighbor)) {
        d3.select("#ne-"+neighbor)
            .style("visibility", "visible");
    } else {
        d3.select("#ne-"+neighbor)
            .style("visibility", "hidden");
    }
}

function remove_element(arr, ele) {
    const index = arr.indexOf(ele);
    return arr.splice(index, 1);
}

function same_expansion(arr1, arr2) {
    /*
    This method checks whether arr1 and arr2 has the same elements
    fulfilling the condition that the nodes should be either hidden
    or not expanded.
     */
    let expandable_nodes_arr1 = [];
    for (let i = 0; i < arr1.length; i++) {
        if (! node_in_canvas(arr1[i]) || ! is_visible(arr1[i])) {
            expandable_nodes_arr1.push(arr1[i]);
        }
    }

    for (let i = 0; i < arr2.length; i++) {
        if (! node_in_canvas(arr2[i]) || ! is_visible(arr2[i])) {
            if (expandable_nodes_arr1.includes(arr2[i])) {
                remove_element(expandable_nodes_arr1, arr2[i]);
            } else {
                return false;
            }
        }
    }
    return true;
}

function enable_simulation(allNodes, allEdges) {
    simulation.nodes(allNodes).on("tick", ticked);
    simulation.force("link").links(allEdges);
    simulation.alpha(1).alphaTarget(0).restart();
}

function position_node_elements() {
    d3.selectAll(".node").moveToFront();
    d3.selectAll(".nodetext").moveToFront();
    d3.selectAll(".nodeimg").moveToFront();
    d3.selectAll(".nodeexp").moveToFront();
}

function position_link_elements() {
    d3.selectAll(".inv_node").moveToFront();
    d3.selectAll(".highlighter-link_container").moveToFront();
    d3.selectAll(".link").moveToFront();
    d3.selectAll(".edgetext").moveToFront();
}

function spawn_nodes(graph, around_node) {
    // ask whether it has been already expanded. If so, do not do anything
    if (expanded_nodes[around_node] !== undefined) return;

    let neighbors = graphManager.getGraph().getNeighbors(around_node);

    // ask whether the expandable icon should be hidden due to new expansions,
    // ie: does the current expansion generate the same nodes that another node
    // on the canvas? If so, such mark is removed from the other nodes, meaning
    // that those nodes are no longer expandable
    // todo: check which expansion cases are affected by this function (same_expansion)
    /*d3.selectAll(".nodeexp")
        .filter(n => same_expansion(neighbors, graphManager.getGraph().getNeighbors(n.id)))
        .style("visibility", "hidden")
        .attr("data-expandable", "false");*/

    // global variable which contains the filtering options, the ones regarding the
    // expansion pruning
    let allNodes;
    if (window.expansion_prop !== undefined) {
        allNodes = get_nodes(around_node, this.nodes, window.expansion_prop);
    } else {
        allNodes = get_nodes(around_node, this.nodes, {});
    }

    // d3 node generation
    node_container = populate_node_container(node_container, allNodes);

    let allEdges;
    if (window.expansion_prop !== undefined) {
        allEdges = get_edges(around_node, this.edges, window.expansion_prop);
    } else {
        allEdges = get_edges(around_node, this.edges, {});
    }

    link_container = populate_link_container(link_container, allEdges);
    // simulation
    enable_simulation(allNodes, allEdges);

    // positioning the node elements (prototype functions overridden)
    position_node_elements();

    // todo: check only for the expanded nodes
    d3.selectAll(".nodeexp")
        .filter(n => neighbors.includes(n.id) && is_expandable(n.id))
        .style("visibility", "visible")
        .attr("data-expandable", "true");

    // removing the icon of the current node that indicates the expandability of such node
    d3.select("#ne-"+around_node)
        .style("visibility", "hidden")
        .attr("data-expandable", "false");

    // positioning the edge elements
    position_link_elements();

    d3.selectAll(".edgeg")
        .filter(link =>
            d3.select("#"+link.source.id).style("visibility") === "hidden" ||
            d3.select("#"+link.target.id).style("visibility") === "hidden"
        ).style("visibility", "hidden");

    // could happen that when expanding the highlighter is activated
    highlight();
    highlight_node_edges(window.node_highlighted, window.node_highlighted === null);
}

function populate_node_container(empty_node_container, allNodes) {
    empty_node_container = empty_node_container.data(allNodes, function(d) {
        return d.id;
    });
    empty_node_container.exit().remove();
    let newNode = create_node(empty_node_container);

    return empty_node_container.merge(newNode);
}

function populate_link_container(empty_link_container, allEdges) {
    empty_link_container = empty_link_container.data(allEdges, function(d) {
        return d.id;
    });
    empty_link_container.exit().remove();
    let newLink = create_link(empty_link_container);

    return empty_link_container.merge(newLink);
}

// Drag events ... d3 thing
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    /*d.fx = d3.event.x;
    d.fy = d3.event.y;*/
    d.fx = null;
    d.fy = null;
}

function ticked() {
    node_container
        .attr("transform", function(d) {
            return "translate("+d.x+","+ d.y+")";
        });

    // the edge, x1 and y1 origin. x2 and y2 target
    link_container.selectAll("line")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // the edge's text
    link_container.select("text")
        .attr("x", function(d) {
            if (d.source.x > d.target.x) {
                return d.source.x - Math.abs(d.source.x-d.target.x)/2+"px";
            } else {
                return d.target.x - Math.abs(d.source.x-d.target.x)/2+"px";
            }
        })
        .attr("y", function(d) {
            if (d.source.y > d.target.y) {
                return d.source.y - Math.abs(d.target.y-d.source.y)/2+"px";
            } else {
                return d.target.y - Math.abs(d.target.y-d.source.y)/2+"px";
            }
        })
}
