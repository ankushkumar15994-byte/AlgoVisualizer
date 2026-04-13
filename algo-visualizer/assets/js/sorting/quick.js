// Quick Sort Algorithm

class QuickSort {
    constructor() {
        this.array = [];
        this.comparisons = 0;
        this.swaps = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
        this.callback = null;
    }

    async sort(arr, speedCallback) {
        this.array = cloneArray(arr);
        this.comparisons = 0;
        this.swaps = 0;
        this.isRunning = true;
        this.isPaused = false;
        this.callback = speedCallback;

        await this.quickSort(0, this.array.length - 1);

        this.isRunning = false;
        return {
            array: this.array,
            comparisons: this.comparisons,
            swaps: this.swaps
        };
    }

    async quickSort(low, high) {
        if (!this.isRunning) return;

        if (low < high) {
            const pi = await this.partition(low, high);

            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }

    async partition(low, high) {
        const pivot = this.array[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            while (this.isPaused) {
                await delay(100);
            }

            if (!this.isRunning) return i + 1;

            this.comparisons++;

            this.callback({
                comparing: [j, high],
                array: this.array,
                comparisons: this.comparisons,
                swaps: this.swaps
            });

            await delay((100 - this.speed) * 2);

            if (this.array[j] < pivot) {
                i++;
                swap(this.array, i, j);
                this.swaps++;

                this.callback({
                    swapping: [i, j],
                    array: this.array,
                    comparisons: this.comparisons,
                    swaps: this.swaps
                });

                await delay((100 - this.speed) * 2);
            }
        }

        swap(this.array, i + 1, high);
        this.swaps++;

        this.callback({
            array: this.array,
            comparisons: this.comparisons,
            swaps: this.swaps
        });

        return i + 1;
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
