// Breadth-First Search (BFS)

class BFS {
    constructor() {
        this.graph = {};
        this.visited = new Set();
        this.queue = [];
        this.path = [];
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
    }

    async search(graph, startNode, endNode, callback) {
        this.graph = graph;
        this.visited = new Set();
        this.queue = [];
        this.path = [];
        this.isRunning = true;
        this.isPaused = false;

        const parent = {};
        this.queue.push(startNode);
        this.visited.add(startNode);
        parent[startNode] = null;

        let nodesVisited = 0;
        let found = false;

        while (this.queue.length > 0 && this.isRunning) {
            while (this.isPaused) {
                await delay(100);
            }

            const node = this.queue.shift();
            nodesVisited++;

            // Show current node being processed
            callback({
                visited: Array.from(this.visited),
                current: node,
                queue: [...this.queue],
                nodesVisited,
                path: this.path
            });

            await delay(Math.max(10, (100 - this.speed) * 2));

            if (node === endNode) {
                this.path = this.reconstructPath(parent, endNode);
                found = true;
                break;
            }

            // Neighbors are stored as an object { neighborId: weight }
            const neighbors = this.graph[node] || {};
            for (const neighbor of Object.keys(neighbors)) {
                if (!this.visited.has(neighbor)) {
                    this.visited.add(neighbor);
                    parent[neighbor] = node;
                    this.queue.push(neighbor);
                }
            }
        }

        this.isRunning = false;
        return {
            visited: Array.from(this.visited),
            path: this.path,
            nodesVisited
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

    pause()  { this.isPaused = true; }
    resume() { this.isPaused = false; }
    stop()   { this.isRunning = false; }
    setSpeed(speed) { this.speed = speed; }
}
