// Selection Sort Algorithm

class SelectionSort {
    constructor() {
        this.array = [];
        this.comparisons = 0;
        this.swaps = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
    }

    async sort(arr, speedCallback) {
        this.array = cloneArray(arr);
        this.comparisons = 0;
        this.swaps = 0;
        this.isRunning = true;
        this.isPaused = false;

        const n = this.array.length;

        for (let i = 0; i < n - 1; i++) {
            if (!this.isRunning) break;

            let minIndex = i;

            for (let j = i + 1; j < n; j++) {
                while (this.isPaused) {
                    await delay(100);
                }

                if (!this.isRunning) break;

                this.comparisons++;

                speedCallback({
                    comparing: [i, j],
                    sorted: Array.from({length: i}, (_, k) => k),
                    array: this.array,
                    comparisons: this.comparisons,
                    swaps: this.swaps
                });

                await delay((100 - this.speed) * 2);

                if (this.array[j] < this.array[minIndex]) {
                    minIndex = j;
                }
            }

            if (minIndex !== i) {
                swap(this.array, i, minIndex);
                this.swaps++;

                speedCallback({
                    swapping: [i, minIndex],
                    sorted: Array.from({length: i + 1}, (_, k) => k),
                    array: this.array,
                    comparisons: this.comparisons,
                    swaps: this.swaps
                });

                await delay((100 - this.speed) * 2);
            }
        }

        this.isRunning = false;
        return {
            array: this.array,
            comparisons: this.comparisons,
            swaps: this.swaps
        };
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
    }

    setSpeed(speed) {
        this.speed = speed;
    }
}
