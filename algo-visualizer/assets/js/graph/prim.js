// Prim's Minimum Spanning Tree Algorithm

class Prim {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
        this.mstEdges = [];
    }

    async run(adjacency, startNode, callback) {
        this.isRunning = true;
        this.isPaused = false;
        this.mstEdges = [];

        const nodes = Object.keys(adjacency);
        const inMST = new Set();
        const key = {};    // min edge weight to reach this node
        const parent = {}; // which node it connects from

        nodes.forEach(n => { key[n] = Infinity; parent[n] = null; });
        key[startNode] = 0;

        let totalWeight = 0;
        let edgesAdded = 0;

        for (let iter = 0; iter < nodes.length; iter++) {
            if (!this.isRunning) break;
            while (this.isPaused) await delay(100);

            // Pick node not in MST with minimum key
            let u = null;
            nodes.forEach(n => {
                if (!inMST.has(n) && (u === null || key[n] < key[u])) u = n;
            });

            if (u === null || key[u] === Infinity) break;

            inMST.add(u);

            if (parent[u] !== null) {
                const edge = { u: parent[u], v: u, w: key[u] };
                this.mstEdges.push(edge);
                edgesAdded++;
                totalWeight += key[u];
            }

            callback({
                current: u,
                inMST: Array.from(inMST),
                mstEdges: [...this.mstEdges],
                edgesAdded,
                totalWeight,
                nodesVisited: inMST.size
            });
            await delay(Math.max(10, (100 - this.speed) * 2));

            // Update keys of adjacent nodes
            Object.keys(adjacency[u]).forEach(v => {
                const w = adjacency[u][v];
                if (!inMST.has(v) && w < key[v]) {
                    key[v] = w;
                    parent[v] = u;
                }
            });
        }

        this.isRunning = false;
        return { mstEdges: this.mstEdges, totalWeight, edgesAdded };
    }

    pause()  { this.isPaused = true; }
    resume() { this.isPaused = false; }
    stop()   { this.isRunning = false; }
    setSpeed(s) { this.speed = s; }
}
