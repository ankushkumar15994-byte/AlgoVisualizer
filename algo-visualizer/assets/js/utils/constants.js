// ===== Constants =====

const COLORS = {
    primary: '#667eea', secondary: '#764ba2', success: '#48bb78',
    danger: '#f56565', warning: '#ed8936', disabled: '#cbd5e0',
    comparing: '#ed8936', sorted: '#48bb78', swapping: '#f56565',
    visited: '#667eea', unvisited: '#4a5568', path: '#48bb78'
};

const ANIMATION_SPEED = { FAST: 10, NORMAL: 50, SLOW: 100 };
const DEFAULT_DELAY = 50;

// ── Algorithm metadata with full complexity breakdown ──────────────────────
const ALGORITHM_INFO = {
    bubble: {
        name: 'Bubble Sort',
        description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if in the wrong order.',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        best:    { time: 'Ω(n)',   condition: 'Already sorted array',        ops: n => n },
        average: { time: 'Θ(n²)',  condition: 'Random order array',           ops: n => n * n / 2 },
        worst:   { time: 'O(n²)',  condition: 'Reverse sorted array',         ops: n => n * n },
        detectCase: ({ comparisons, n }) => {
            const ratio = comparisons / (n * n);
            if (ratio < 0.15) return 'best';
            if (ratio < 0.65) return 'average';
            return 'worst';
        }
    },
    selection: {
        name: 'Selection Sort',
        description: 'Finds the minimum element in the unsorted part and places it at the beginning each pass.',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        best:    { time: 'Ω(n²)', condition: 'Always O(n²) — no early exit', ops: n => n * n / 2 },
        average: { time: 'Θ(n²)', condition: 'Any input order',               ops: n => n * n / 2 },
        worst:   { time: 'O(n²)', condition: 'Any input order',               ops: n => n * n / 2 },
        detectCase: () => 'average'
    },
    merge: {
        name: 'Merge Sort',
        description: 'Divide-and-conquer: splits array in halves, recursively sorts, then merges back.',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        best:    { time: 'Ω(n log n)', condition: 'Always O(n log n)',         ops: n => Math.round(n * Math.log2(Math.max(n,1))) },
        average: { time: 'Θ(n log n)', condition: 'Any input order',           ops: n => Math.round(n * Math.log2(Math.max(n,1))) },
        worst:   { time: 'O(n log n)', condition: 'Any input order',           ops: n => Math.round(n * Math.log2(Math.max(n,1))) },
        detectCase: () => 'average'
    },
    quick: {
        name: 'Quick Sort',
        description: 'Picks a pivot, partitions array around it, recursively sorts each partition.',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(log n)',
        best:    { time: 'Ω(n log n)', condition: 'Pivot always splits evenly',  ops: n => Math.round(n * Math.log2(Math.max(n,1))) },
        average: { time: 'Θ(n log n)', condition: 'Random pivot selection',      ops: n => Math.round(1.39 * n * Math.log2(Math.max(n,1))) },
        worst:   { time: 'O(n²)',       condition: 'Already sorted / all equal',  ops: n => n * n },
        detectCase: ({ comparisons, n }) => {
            const nlogn = n * Math.log2(Math.max(n, 1));
            const ratio = comparisons / nlogn;
            if (ratio < 1.5) return 'best';
            if (ratio < 3)   return 'average';
            return 'worst';
        }
    },
    bfs: {
        name: 'BFS (Breadth-First Search)',
        description: 'Explores vertices layer by layer, visiting all neighbors at current depth first.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        best:    { time: 'Ω(1)',     condition: 'Target is the start node',    ops: () => 1 },
        average: { time: 'Θ(V + E)', condition: 'Target in middle of graph',   ops: (v, e) => v/2 + e/2 },
        worst:   { time: 'O(V + E)', condition: 'Target is last node / absent',ops: (v, e) => v + e },
        detectCase: ({ nodesVisited, totalNodes }) => {
            const ratio = nodesVisited / Math.max(totalNodes, 1);
            if (ratio < 0.25) return 'best';
            if (ratio < 0.75) return 'average';
            return 'worst';
        }
    },
    dfs: {
        name: 'DFS (Depth-First Search)',
        description: 'Explores as far as possible along each branch before backtracking.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        best:    { time: 'Ω(1)',     condition: 'Target is adjacent to start',  ops: () => 1 },
        average: { time: 'Θ(V + E)', condition: 'Target in middle of graph',    ops: (v, e) => v/2 + e/2 },
        worst:   { time: 'O(V + E)', condition: 'Target is last node / absent', ops: (v, e) => v + e },
        detectCase: ({ nodesVisited, totalNodes }) => {
            const ratio = nodesVisited / Math.max(totalNodes, 1);
            if (ratio < 0.25) return 'best';
            if (ratio < 0.75) return 'average';
            return 'worst';
        }
    },
    dijkstra: {
        name: "Dijkstra's Algorithm",
        description: 'Finds shortest path in a weighted graph using a greedy approach with a priority queue.',
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V)',
        best:    { time: 'Ω(V log V)',       condition: 'Sparse graph, target near start', ops: v => Math.round(v * Math.log2(Math.max(v,1))) },
        average: { time: 'Θ((V+E) log V)',   condition: 'Average connectivity',            ops: (v,e) => Math.round((v+e) * Math.log2(Math.max(v,1))) },
        worst:   { time: 'O((V+E) log V)',   condition: 'Dense graph, target far away',    ops: (v,e) => Math.round((v+e) * Math.log2(Math.max(v,1))) },
        detectCase: ({ nodesVisited, totalNodes }) => {
            const ratio = nodesVisited / Math.max(totalNodes, 1);
            if (ratio < 0.3) return 'best';
            if (ratio < 0.8) return 'average';
            return 'worst';
        }
    },
    kruskal: {
        name: "Kruskal's Algorithm",
        description: 'Builds MST by sorting edges and greedily adding non-cycle edges using Union-Find.',
        timeComplexity: 'O(E log E)',
        spaceComplexity: 'O(V)',
        best:    { time: 'Ω(E log E)', condition: 'All edges already sorted',  ops: e => e },
        average: { time: 'Θ(E log E)', condition: 'Random edge weights',       ops: e => Math.round(e * Math.log2(Math.max(e,1))) },
        worst:   { time: 'O(E log E)', condition: 'Dense graph, many edges',   ops: e => Math.round(e * Math.log2(Math.max(e,1))) },
        detectCase: () => 'average'
    },
    prim: {
        name: "Prim's Algorithm",
        description: 'Builds MST by starting from a node and always adding the cheapest connecting edge.',
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V)',
        best:    { time: 'Ω(V log V)',     condition: 'Sparse graph',         ops: v => Math.round(v * Math.log2(Math.max(v,1))) },
        average: { time: 'Θ((V+E) log V)', condition: 'Average connectivity', ops: (v,e) => Math.round((v+e) * Math.log2(Math.max(v,1))) },
        worst:   { time: 'O((V+E) log V)', condition: 'Dense graph',          ops: (v,e) => Math.round((v+e) * Math.log2(Math.max(v,1))) },
        detectCase: () => 'average'
    },
    bruteforce: {
        name: 'Brute Force TSP',
        description: 'Tries every possible permutation of cities to find the shortest tour.',
        timeComplexity: 'O(n!)',
        spaceComplexity: 'O(n)',
        best:    { time: 'Ω(n!)', condition: 'Always checks all permutations', ops: n => _factorial(n) },
        average: { time: 'Θ(n!)', condition: 'Always checks all permutations', ops: n => _factorial(n) },
        worst:   { time: 'O(n!)', condition: 'Always checks all permutations', ops: n => _factorial(n) },
        detectCase: () => 'worst'
    },
    greedy: {
        name: 'Greedy TSP (Nearest Neighbor)',
        description: 'Always travels to the nearest unvisited city. Fast but not always optimal.',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(n)',
        best:    { time: 'Ω(n²)', condition: 'Always O(n²) — checks all unvisited', ops: n => n * n / 2 },
        average: { time: 'Θ(n²)', condition: 'Random city placement',               ops: n => n * n / 2 },
        worst:   { time: 'O(n²)', condition: 'Worst city arrangement',               ops: n => n * n },
        detectCase: () => 'average'
    },
    dp: {
        name: 'Dynamic Programming TSP',
        description: 'Uses Held-Karp DP to find optimal tour via subproblem memoization.',
        timeComplexity: 'O(n² 2ⁿ)',
        spaceComplexity: 'O(n 2ⁿ)',
        best:    { time: 'Ω(n² 2ⁿ)', condition: 'Always same complexity', ops: n => n * n * Math.pow(2, n) },
        average: { time: 'Θ(n² 2ⁿ)', condition: 'Always same complexity', ops: n => n * n * Math.pow(2, n) },
        worst:   { time: 'O(n² 2ⁿ)', condition: 'Always same complexity', ops: n => n * n * Math.pow(2, n) },
        detectCase: () => 'worst'
    }
};

function _factorial(n) {
    if (n <= 1) return 1;
    if (n > 12) return Infinity;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

const EVENTS = {
    START: 'start', PAUSE: 'pause', RESUME: 'resume',
    RESET: 'reset', COMPLETE: 'complete', STEP: 'step'
};
