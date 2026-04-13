// Bubble Sort Algorithm

class BubbleSort {
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

            for (let j = 0; j < n - i - 1; j++) {
                while (this.isPaused) {
                    await delay(100);
                }

                if (!this.isRunning) break;

                this.comparisons++;
                
                // Execute callback with current state
                speedCallback({
                    comparing: [j, j + 1],
                    sorted: Array.from({length: n - i}, (_, k) => n - 1 - k),
                    array: this.array,
                    comparisons: this.comparisons,
                    swaps: this.swaps
                });

                await delay((100 - this.speed) * 2);

                if (this.array[j] > this.array[j + 1]) {
                    swap(this.array, j, j + 1);
                    this.swaps++;

                    speedCallback({
                        swapping: [j, j + 1],
                        array: this.array,
                        comparisons: this.comparisons,
                        swaps: this.swaps
                    });

                    await delay((100 - this.speed) * 2);
                }
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
