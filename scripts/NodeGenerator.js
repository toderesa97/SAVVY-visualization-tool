function create_node(node) {
    let newNode = create_node_object(node);
    create_control_layer(newNode);
    create_info_layer(newNode);
    create_background_layer(newNode);
    create_highlighter_layer(newNode);
    bind_events(newNode);
    return newNode;
}

function create_node_object(node) {
    return node.enter()
        .append("g")
        .attr("class", "nodeg")
        .attr("id", function (d) {
            return "g-" + d.id;
        })
        .attr("class", function (d) {
            return "type type-" + d.type;
        });
}

function bind_events(node) {
    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );
}

function create_highlighter_layer(node) {
    node.append("circle")
        .attr("class", function(d) {
            return "highlighter-circles "+d.type;
        })
        .attr("fill-opacity", 0)
        .attr("r", radius+20)
        .attr("fill", "rgb(150,150,150)")
        .attr("id", function(d) {
            return "hc-"+d.id;
        });
}

function create_background_layer(node) {
    node.append("circle")
        .attr("class", "node")
        .attr("r", radius)
        .attr("fill", function(d) {
            return node_properties[d.type] !== undefined ? node_properties[d.type]['color'] : default_color;
        })
        .attr("id", function(d) {
            return d.id;
        })
        .attr("filter", "url(#blur)");
}

function add_text(node) {
    node.append("text")
        .text(function (d) {
            return d.original_name.toUpperCase();
        })
        .attr("font-family", "Comic Sans MS")
        .attr("font-size", "18px")
        .attr("fill", "black")
        .attr("class", "nodetext")
        .attr("id", function (d) {
            return "t-" + d.id;
        })
        .style("text-anchor", "middle")
        .attr("x", 0).attr("y", function (d) {
        return d.original_name.includes("\n") ? -20 : 0;
    });
}

function add_icon(node) {
    node.append("svg:image")
        .attr("href", function (d) {
            return node_properties[d.type] !== undefined ? node_properties[d.type]['icon'] : "";
        })
        .attr("width", "30")
        .attr("height", "30")
        .attr("id", function (d) {
            return "i-" + d.id;
        })
        .attr("class", "nodeimg");
}

function add_expansion_icon(node) {
    node.append("svg:image")
        .attr("href", function (d) {
            return expand_path_icon;
        })
        .attr("width", "30")
        .attr("height", "30")
        .attr("for-node", function (d) {
            return d.id;
        })
        .attr("x", function (d) {
            return 25;
        })
        .attr("y", function (d) {
            return -45;
        })
        .attr("id", function (d) {
            return "ne-" + d.id;
        })
        .attr("class", "nodeexp")
        .style("visibility", "hidden");
}

function create_info_layer(node) {
    add_text(node);
    add_icon(node);
    add_expansion_icon(node);
}

function create_control_layer(node) {
    return node.append("circle")
        .attr("class", function(d) {
            return "inv_node";
        })
        .attr("r", radius)
        .attr("fill", "red")
        .attr("fill-opacity", 0)
        .attr("id", function(d) {
            return "inv_"+d.id;
        })
        .on("contextmenu", function (d, i) {
            d3.event.preventDefault();
            deexpand_node(d.id);
        })
        .on("dblclick", function(d) {
            spawn_nodes(graphManager.getGraph(), d.id);
            make_deexpanded_nodes_visible_rough(d.id);
        })
        .on("click", function(d) {
            let isHighLighted = d3.select("#"+d.id).attr("data-highlight");
            if (window.node_highlighted === undefined) {
                highlight_node_edges(d.id, isHighLighted);
            } else {
                highlight_node_edges(window.node_highlighted, "true");
                highlight_node_edges(d.id, isHighLighted);
            }
        });
}