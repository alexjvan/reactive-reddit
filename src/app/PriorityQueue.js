export default class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    enqueue(value, priority) {
        this.heap.push([priority, value]);
        this.bubbleUp();
    }

    dequeue() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop()[1]; // Only return value, not priority

        const min = this.heap[0][1]; // Extract value
        this.heap[0] = this.heap.pop(); // Move last element to top
        this.bubbleDown();
        return min;
    }

    bubbleUp() {
        let index = this.heap.length - 1;
        let element = this.heap[index];

        while (index > 0) {
            let parentIndex = (index - 1) >> 1; // Faster than Math.floor()
            let parent = this.heap[parentIndex];

            if (element[0] >= parent[0]) break; // Compare priority only

            this.heap[index] = parent; // Shift parent down
            index = parentIndex;
        }
        this.heap[index] = element; // Final placement
    }

    bubbleDown() {
        let index = 0;
        const length = this.heap.length;
        let element = this.heap[0];

        while (true) {
            let leftChildIndex = (index << 1) + 1;
            let rightChildIndex = leftChildIndex + 1;
            let smallest = index;

            if (leftChildIndex < length && this.heap[leftChildIndex][0] < element[0]) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex < length && this.heap[rightChildIndex][0] < this.heap[smallest][0]) {
                smallest = rightChildIndex;
            }
            if (smallest === index) break;

            this.heap[index] = this.heap[smallest];
            index = smallest;
        }
        this.heap[index] = element;
    }

    peek() {
        return this.heap.length === 0 ? null : this.heap[0][1]; // Return value only
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}
