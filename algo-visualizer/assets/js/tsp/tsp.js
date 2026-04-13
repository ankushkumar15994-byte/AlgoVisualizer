// TSP Solver - Multiple Approaches

class TSPSolver {
    constructor() {
        this.cities = [];
        this.bestDistance = Infinity;
        this.bestRoute = [];
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
    }

    /**
     * Brute Force TSP - Try all permutations
     */
    async solveBruteForce(cities, callback) {
        this.cities = cities;
        this.bestDistance = Infinity;
        this.bestRoute = [];
        this.isRunning = true;
        this.isPaused = false;

        const indices = Array.from({length: cities.length}, (_, i) => i);
        let routesChecked = 0;

        const permute = async (arr, l = 0) => {
            if (!this.isRunning) return;

            while (this.isPaused) {
                await delay(100);
            }

            if (l === arr.length - 1) {
                routesChecked++;
                const distance = this.calculateTourDistance(arr);

                if (distance < this.bestDistance) {
                    this.bestDistance = distance;
                    this.bestRoute = [...arr];
                }

                if (routesChecked % 100 === 0) {
                    callback({
                        bestDistance: this.bestDistance,
                        bestRoute: this.bestRoute,
                        routesChecked,
                        currentRoute: arr
                    });

                    await delay((100 - this.speed) * 2);
                }
            } else {
                for (let i = l; i < arr.length; i++) {
                    [arr[l], arr[i]] = [arr[i], arr[l]];
                    await permute(arr, l + 1);
                    [arr[l], arr[i]] = [arr[i], arr[l]];
                }
            }
        };

        await permute(indices);

        this.isRunning = false;
        return {
            bestRoute: this.bestRoute,
            bestDistance: this.bestDistance,
            routesChecked
        };
    }

    /**
     * Greedy TSP - Always go to nearest unvisited city
     */
    async solveGreedy(cities, callback) {
        this.cities = cities;
        this.bestDistance = 0;
        this.bestRoute = [];
        this.isRunning = true;
        this.isPaused = false;

        const visited = new Set([0]);
        this.bestRoute = [0];
        let current = 0;

        for (let i = 1; i < cities.length; i++) {
            while (this.isPaused) {
                await delay(100);
            }

            if (!this.isRunning) break;

            let nearest = -1;
            let minDistance = Infinity;

            for (let j = 0; j < cities.length; j++) {
                if (!visited.has(j)) {
                    const dist = distance(cities[current], cities[j]);
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearest = j;
                    }
                }
            }

            this.bestDistance += minDistance;
            visited.add(nearest);
            this.bestRoute.push(nearest);
            current = nearest;

            callback({
                bestDistance: this.bestDistance,
                bestRoute: this.bestRoute,
                visited: Array.from(visited)
            });

            await delay((100 - this.speed) * 2);
        }

        // Add distance from last city to start
        this.bestDistance += distance(cities[current], cities[0]);

        this.isRunning = false;
        return {
            bestRoute: this.bestRoute,
            bestDistance: this.bestDistance
        };
    }

    /**
     * Calculate total distance of a tour
     */
    calculateTourDistance(route) {
        let total = 0;
        for (let i = 0; i < route.length; i++) {
            const from = this.cities[route[i]];
            const to = this.cities[route[(i + 1) % route.length]];
            total += distance(from, to);
        }
        return total;
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
