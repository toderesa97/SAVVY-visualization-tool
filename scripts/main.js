var graphManager;

function init_app(data_reference, node) {
    d3.select("svg").remove();

    create_pan_zoomable_svg("body", "100%", "100%");

    let graph = new GraphInitializer(new graphlib.Graph(), data_reference.nodes, data_reference.edges);
    graphManager = new GraphManager(graph);
    spawn_nodes(graph, "n"+node, {clearAll : true});
}

init_app(theData, "eifer");