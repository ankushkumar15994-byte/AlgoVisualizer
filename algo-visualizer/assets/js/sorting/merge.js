// Merge Sort Algorithm

class MergeSort {
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

        await this.mergeSort(0, this.array.length - 1);

        this.isRunning = false;
        return {
            array: this.array,
            comparisons: this.comparisons,
            swaps: this.swaps
        };
    }

    async mergeSort(left, right) {
        if (!this.isRunning) return;

        if (left < right) {
            const mid = Math.floor((left + right) / 2);

            await this.mergeSort(left, mid);
            await this.mergeSort(mid + 1, right);
            await this.merge(left, mid, right);
        }
    }

    async merge(left, mid, right) {
        const leftArr = this.array.slice(left, mid + 1);
        const rightArr = this.array.slice(mid + 1, right + 1);

        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length) {
            while (this.isPaused) {
                await delay(100);
            }

            if (!this.isRunning) return;

            this.comparisons++;

            this.callback({
                comparing: [left + i, mid + 1 + j],
                array: this.array,
                comparisons: this.comparisons,
                swaps: this.swaps
            });

            await delay((100 - this.speed) * 2);

            if (leftArr[i] <= rightArr[j]) {
                this.array[k++] = leftArr[i++];
            } else {
                this.array[k++] = rightArr[j++];
            }
            this.swaps++;

            this.callback({
                array: this.array,
                comparisons: this.comparisons,
                swaps: this.swaps
            });
        }

        while (i < leftArr.length) {
            this.array[k++] = leftArr[i++];
            this.swaps++;
        }

        while (j < rightArr.length) {
            this.array[k++] = rightArr[j++];
            this.swaps++;
        }
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
