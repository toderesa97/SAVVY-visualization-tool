class GraphManager {

    constructor(graph) {
        this.graphInitializer = graph;
    }

    getGraph() {
        return this.graphInitializer;
    }

    setGraph(graph) {
        this.graphInitializer = graph;
    }

}