// Dijkstra's Algorithm

class Dijkstra {
    constructor() {
        this.graph = {};
        this.distances = {};
        this.visited = new Set();
        this.path = [];
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
    }

    async search(graph, startNode, endNode, callback) {
        this.graph = graph;
        this.distances = {};
        this.visited = new Set();
        this.path = [];
        this.isRunning = true;
        this.isPaused = false;

        const nodes = Object.keys(graph);
        const parent = {};

        // Initialize distances
        for (const node of nodes) {
            this.distances[node] = Infinity;
            parent[node] = null;
        }
        this.distances[startNode] = 0;

        for (let i = 0; i < nodes.length && this.isRunning; i++) {
            while (this.isPaused) {
                await delay(100);
            }

            // Find unvisited node with minimum distance
            let minNode = null;
            let minDistance = Infinity;

            for (const node of nodes) {
                if (!this.visited.has(node) && this.distances[node] < minDistance) {
                    minDistance = this.distances[node];
                    minNode = node;
                }
            }

            if (minNode === null) break;

            this.visited.add(minNode);

            callback({
                visited: Array.from(this.visited),
                distances: {...this.distances},
                current: minNode,
                path: this.path,
                nodesVisited: this.visited.size
            });

            await delay((100 - this.speed) * 2);

            if (minNode === endNode) break;

            // Update distances
            const neighbors = this.graph[minNode] || [];
            for (const neighbor in neighbors) {
                const distance = this.distances[minNode] + neighbors[neighbor];
                if (distance < this.distances[neighbor]) {
                    this.distances[neighbor] = distance;
                    parent[neighbor] = minNode;
                }
            }
        }

        this.path = this.reconstructPath(parent, endNode);

        this.isRunning = false;
        return {
            visited: Array.from(this.visited),
            distances: this.distances,
            path: this.path,
            distance: this.distances[endNode]
        };
    }

    reconstructPath(parent, endNode) {
        const path = [];
        let current = endNode;

        while (current !== null && current !== undefined) {
            path.unshift(current);
            current = parent[current];
        }

        return path;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        this.isRunning = false;
    }

    setSpeed(speed) {
        this.speed = speed;
    }
}
