/// <reference types="vite/client" />
const workerUrl = new URL('./NgspiceWorker.ts', import.meta.url);
const worker = new Worker(workerUrl);
export type SimulationResult = { rawOutput: string };


export class NgspiceEngine {
    private netlist: string = "";

    /**
     * Set the SPICE netlist to be simulated.
     */
    setNetList(netlist: string) {
        this.netlist = netlist;
    }

    async start(): Promise<void> {
        // ngspice.js cannot be reliably re-run in the same worker context because callMain is stripped
        // from the compiled binary. Therefore, we instantiate a fresh worker for every run.
        // This method exists to satisfy the eecircuit-engine initialization interface.
        return Promise.resolve();
    }

    /**
     * Run the simulation using a Web Worker to avoid blocking the main thread.
     * Returns the raw string output from the ngspice console.
     */
    async runSim(): Promise<{ rawOutput: string }> {
        if (!this.netlist) {
            throw new Error("No netlist provided. Call setNetList() first.");
        }

        return new Promise((resolve, reject) => {
            const workerUrl = new URL('./NgspiceWorker.ts', import.meta.url);
            const worker = new Worker(workerUrl);

            worker.onmessage = (e: MessageEvent) => {
                const { type, text, output } = e.data;

                if (type === 'PRINT') {
                    // console.log("[ngspice]", text);
                } else if (type === 'ERROR') {
                    // Filter out benign environment warnings typical of C/WASM
                    const ignored = [
                        'fopen("/proc/meminfo")',
                        'fopen("/proc/%d/statm")',
                        "Note: can't find init file."
                    ];
                    if (!ignored.some(msg => text.includes(msg))) {
                        console.error("[ngspice error]", text);
                    }
                } else if (type === 'DONE') {
                    worker.terminate();
                    resolve({ rawOutput: output });
                }
            };

            worker.onerror = (err: ErrorEvent) => {
                worker.terminate();
                reject(err);
            };

            worker.postMessage({
                type: 'SIMULATE',
                netlist: this.netlist,
                ngspiceJsUrl: new URL('../lib/ngspice.js', import.meta.url).href,
                ngspiceWasmUrl: new URL('../lib/ngspice.wasm', import.meta.url).href
            });
        });
    }
}
