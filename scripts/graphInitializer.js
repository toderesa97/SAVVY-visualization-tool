class GraphInitializer {

	constructor(graphInstance, nodes, edges) {
		this.graphInstance = graphInstance;
        this.labels = {};
        this.types = {};
        let colors_index = 0;
		for (let i = 0; i < nodes.length; i++) {
		    let n = nodes[i].id.toLowerCase().replace(" ", "");
		    if (nodes[i].original_name === undefined) {
		        nodes[i]['original_name'] = n;
            }
            if (nodes[i].type !== undefined) {
		        if (! (nodes[i].type in this.types)) {
		            this.types[nodes[i].type] = "";
		            if (colors.length > colors_index) {
                        node_properties[nodes[i].type] = { color : colors[colors_index++]};
                    } else {
                        node_properties[nodes[i].type] = { color: default_color };
                    }
                }
            }
            nodes[i].id = "n"+n;
	        this.graphInstance.setNode("n"+n, nodes[i]);
        }
        for (let edge_index = 0; edge_index < edges.length ; edge_index++ ) {
	        let theEdge = edges[edge_index];
	        let src = "n"+theEdge["source"].toLowerCase().replace(" ", "");
	        theEdge['source'] = src;
	        let target = "n"+theEdge["target"].toLowerCase().replace(" ", "");
	        theEdge['target'] = target;
            theEdge['id'] = src+"-"+target;
            theEdge['labeled'] = theEdge['labeled'].toLowerCase();
	        this.graphInstance.setEdge(src, target, theEdge);
	        this.labels[theEdge['labeled']] = "";
        }
	}

	getNodes() {
		return this.graphInstance.nodes();
	}

	getDistinctTypes() {
	    return Object.keys(this.types);
    }

	getDistinctNodeNames() {
	    let content = [];
	    let current_nodes = this.graphInstance.nodes();
        for (let i = 0; i < current_nodes.length; i++) {
            if (this.getNeighbors(current_nodes[i]).length === 0) {
                continue;
            }
            let node = this.getNode(current_nodes[i]);
            if (node === undefined) {
                content.push({"id" : current_nodes[i], "label" : current_nodes[i].substring(1)});
                this.graphInstance.setNode(current_nodes[i], {id: current_nodes[i],
                    original_name: current_nodes[i].substring(1), type: "default"});
            } else {
                content.push({"id" : node.id, "label" : node.original_name});
            }
        }
        return content;
    }

	getEdgeLabels(node) {
	    let neighbors = this.graphInstance.neighbors(node);
	    let labels = [];
	    for (let i = 0; i < neighbors.length; i++) {
	        if (this.graphInstance.hasEdge(node, neighbors[i])) {
	            let label = this.graphInstance.edge(node, neighbors[i])['labeled'];
	            if (! labels.includes(label)) {
	                labels.push(label);
                }
            } else {
                let label = this.graphInstance.edge(neighbors[i], node)['labeled'];
                if (! labels.includes(label)) {
                    labels.push(label);
                }
            }
        }
        return labels;
    }

    getLabels() {
	    return this.labels;
    }

    getLabelsForSuggestor() {
	    let all_labels = Object.keys(this.labels);
	    let labels = [];
        for (let i = 0; i < all_labels.length; i++) {
            labels.push({"id" : all_labels[i], "label" : all_labels[i]});
        }
        return labels;
    }

    getId(original_name) {
	    let nodes = this.getNodes();
        for (let i = 0; i < nodes.length; i++) {
            let node = graph.getNode(nodes[i]);
            if (node.original_name === original_name) {
                return node.id;
            }
        }
    }

	hasLabel(label) {
	    return this.labels[label] !== undefined;
    }

	hasNode(node) {
	    return this.graphInstance.hasNode(node);
    }

	getNode(node) {
	    return this.graphInstance.node(node);
    }

    hasEdge(src, target) {
	    return this.graphInstance.hasEdge(src, target);
    }

	getEdges() {
		return this.graphInstance.edges();
	}

	getEdge(source, target) {
	    return this.graphInstance.edge(source, target);
    }

	getNodeType(node) {
	    return this.hasNode(node) ? this.getNode(node).type: undefined;
    }

	getEdgesPointedTo(target) {
        return this.graphInstance.inEdges(target);
    }

    getEdgesPointedBy(source) {
        return this.graphInstance.outEdges(source);
    }

	getNeighbors(node) {
        return this.graphInstance.neighbors(node);
	}

	getNeighborsFiltered(node, wanted,labels) {
        let wanted_edges = [];
        let exclusive_edges = [];
        let neighbors = this.graphInstance.neighbors(node);
        for (let i = 0; i < neighbors.length; i++) {
            let edge;
            if (this.graphInstance.hasEdge(node, neighbors[i])) {
                edge = this.graphInstance.edge(node, neighbors[i]);
            } else {
                edge = this.graphInstance.edge(neighbors[i], node);
            }
            let labelInArray = labels.includes(edge.labeled);
            if (labelInArray && wanted) {
                wanted_edges.push(neighbors[i]);
            } else {
                if (! labelInArray) exclusive_edges.push(neighbors[i]);
            }
        }
        return wanted ? wanted_edges : exclusive_edges;
	}

}