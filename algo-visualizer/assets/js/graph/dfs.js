// Depth-First Search (DFS)

class DFS {
    constructor() {
        this.graph = {};
        this.visited = new Set();
        this.path = [];
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
    }

    async search(graph, startNode, endNode, callback) {
        this.graph = graph;
        this.visited = new Set();
        this.path = [];
        this.isRunning = true;
        this.isPaused = false;

        const parent = {};
        parent[startNode] = null;

        await this.dfsRecursive(startNode, endNode, parent, callback);

        this.path = this.reconstructPath(parent, endNode);

        this.isRunning = false;
        return {
            visited: Array.from(this.visited),
            path: this.path,
            nodesVisited: this.visited.size
        };
    }

    async dfsRecursive(node, endNode, parent, callback) {
        if (!this.isRunning) return false;

        while (this.isPaused) {
            await delay(100);
        }

        this.visited.add(node);

        callback({
            visited: Array.from(this.visited),
            current: node,
            path: this.path,
            nodesVisited: this.visited.size
        });

        await delay(Math.max(10, (100 - this.speed) * 2));

        if (node === endNode) {
            return true;
        }

        // Neighbors are stored as an object { neighborId: weight }
        const neighbors = this.graph[node] || {};
        for (const neighbor of Object.keys(neighbors)) {
            if (!this.visited.has(neighbor)) {
                parent[neighbor] = node;
                const found = await this.dfsRecursive(neighbor, endNode, parent, callback);
                if (found) return true;
            }
        }

        return false;
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

    pause()  { this.isPaused = true; }
    resume() { this.isPaused = false; }
    stop()   { this.isRunning = false; }
    setSpeed(speed) { this.speed = speed; }
}
