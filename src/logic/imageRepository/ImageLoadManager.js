export class ImageLoadManager {

	static queue = [];
	static isRunning = false;

	static add(fx) {
		ImageLoadManager.queue.push(async () => await fx);
	}

	static run() {
		setTimeout(() => ImageLoadManager.runQueue(), 10);
	}

	static addAndRun(fx) {
		ImageLoadManager.add(fx);
		ImageLoadManager.run();
	}

	static async runQueue() {
		if (!ImageLoadManager.isRunning) {
			ImageLoadManager.isRunning = true;
			await ImageLoadManager.runTasks();
			ImageLoadManager.isRunning = false;
		}
	}

	static async runTasks() {
		while (ImageLoadManager.queue.length > 0) {
			const fx = ImageLoadManager.queue.shift();
			await fx();
		}
	}
}