// A* Search Algorithm

class AStar {
    constructor() {
        this.graph = {};
        this.heuristic = {};
        this.openSet = [];
        this.closedSet = new Set();
        this.path = [];
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
    }

    async search(graph, startNode, endNode, heuristic, callback) {
        this.graph = graph;
        this.heuristic = heuristic;
        this.openSet = [];
        this.closedSet = new Set();
        this.path = [];
        this.isRunning = true;
        this.isPaused = false;

        const gScore = {};
        const fScore = {};
        const parent = {};

        const nodes = Object.keys(graph);
        for (const node of nodes) {
            gScore[node] = Infinity;
            fScore[node] = Infinity;
            parent[node] = null;
        }

        gScore[startNode] = 0;
        fScore[startNode] = this.heuristic[startNode] || 0;
        this.openSet.push(startNode);

        while (this.openSet.length > 0 && this.isRunning) {
            while (this.isPaused) {
                await delay(100);
            }

            // Find node with lowest fScore
            let current = this.openSet[0];
            let currentIndex = 0;

            for (let i = 1; i < this.openSet.length; i++) {
                if (fScore[this.openSet[i]] < fScore[current]) {
                    current = this.openSet[i];
                    currentIndex = i;
                }
            }

            this.openSet.splice(currentIndex, 1);
            this.closedSet.add(current);

            callback({
                visited: Array.from(this.closedSet),
                open: this.openSet,
                current,
                path: this.path,
                nodesVisited: this.closedSet.size
            });

            await delay((100 - this.speed) * 2);

            if (current === endNode) {
                this.path = this.reconstructPath(parent, endNode);
                break;
            }

            const neighbors = this.graph[current] || [];
            for (const neighbor in neighbors) {
                if (this.closedSet.has(neighbor)) continue;

                const tentativeGScore = gScore[current] + neighbors[neighbor];

                if (!this.openSet.includes(neighbor)) {
                    this.openSet.push(neighbor);
                } else if (tentativeGScore >= gScore[neighbor]) {
                    continue;
                }

                parent[neighbor] = current;
                gScore[neighbor] = tentativeGScore;
                fScore[neighbor] = gScore[neighbor] + (this.heuristic[neighbor] || 0);
            }
        }

        this.isRunning = false;
        return {
            visited: Array.from(this.closedSet),
            path: this.path,
            nodesVisited: this.closedSet.size
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
