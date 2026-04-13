// Kruskal's Minimum Spanning Tree Algorithm

class Kruskal {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
        this.mstEdges = [];
    }

    // Union-Find helpers
    _makeSet(nodes) {
        const parent = {}, rank = {};
        nodes.forEach(n => { parent[n] = n; rank[n] = 0; });
        return { parent, rank };
    }

    _find(parent, x) {
        if (parent[x] !== x) parent[x] = this._find(parent, parent[x]);
        return parent[x];
    }

    _union(parent, rank, x, y) {
        const rx = this._find(parent, x), ry = this._find(parent, y);
        if (rx === ry) return false;
        if (rank[rx] < rank[ry]) parent[rx] = ry;
        else if (rank[rx] > rank[ry]) parent[ry] = rx;
        else { parent[ry] = rx; rank[rx]++; }
        return true;
    }

    async run(adjacency, callback) {
        this.isRunning = true;
        this.isPaused = false;
        this.mstEdges = [];

        const nodes = Object.keys(adjacency);
        // Build edge list (undirected — avoid duplicates)
        const seen = new Set();
        const allEdges = [];
        nodes.forEach(u => {
            Object.keys(adjacency[u]).forEach(v => {
                const key = [u, v].sort().join('-');
                if (!seen.has(key)) {
                    seen.add(key);
                    allEdges.push({ u, v, w: adjacency[u][v] });
                }
            });
        });

        // Sort edges by weight ascending
        allEdges.sort((a, b) => a.w - b.w);

        const { parent, rank } = this._makeSet(nodes);
        let edgesAdded = 0;
        let totalWeight = 0;

        for (const edge of allEdges) {
            if (!this.isRunning) break;
            while (this.isPaused) await delay(100);

            // Signal: considering this edge
            callback({
                considering: edge,
                mstEdges: [...this.mstEdges],
                edgesAdded,
                totalWeight,
                nodesVisited: edgesAdded + 1
            });
            await delay(Math.max(10, (100 - this.speed) * 2));

            if (this._union(parent, rank, edge.u, edge.v)) {
                this.mstEdges.push(edge);
                edgesAdded++;
                totalWeight += edge.w;

                callback({
                    accepted: edge,
                    mstEdges: [...this.mstEdges],
                    edgesAdded,
                    totalWeight,
                    nodesVisited: edgesAdded
                });
                await delay(Math.max(10, (100 - this.speed) * 2));

                if (edgesAdded === nodes.length - 1) break; // MST complete
            }
        }

        this.isRunning = false;
        return { mstEdges: this.mstEdges, totalWeight, edgesAdded };
    }

    pause()  { this.isPaused = true; }
    resume() { this.isPaused = false; }
    stop()   { this.isRunning = false; }
    setSpeed(s) { this.speed = s; }
}
