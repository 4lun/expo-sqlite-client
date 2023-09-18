const worker = new Worker(new URL("./web/worker.js", import.meta.url));
worker.onmessage = function ({ data }) {
	console.log(data);
};