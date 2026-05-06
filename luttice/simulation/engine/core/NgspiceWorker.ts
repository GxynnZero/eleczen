/// <reference lib="webworker" />

declare var Module: any;
declare var FS: any;

self.onmessage = async (e) => {
    const { type, netlist, ngspiceJsUrl, ngspiceWasmUrl } = e.data;

    if (type === 'SIMULATE') {
        const outputBuffer: string[] = [];

        self.Module = {
            noInitialRun: false,
            arguments: ["-b", "/circuit.cir"],
            preRun: () => {
                self.FS.writeFile("/circuit.cir", netlist);
            },
            print: (text: string) => {
                outputBuffer.push(text);
                self.postMessage({ type: 'PRINT', text });
            },
            printErr: (text: string) => {
                self.postMessage({ type: 'ERROR', text });
            },
            postRun: () => {
                self.postMessage({ type: 'DONE', output: outputBuffer.join("\n") });
            },
            locateFile: (path: string) => {
                if (path.endsWith('.wasm')) return ngspiceWasmUrl;
                return path;
            },
            quit: (status: number, toThrow: any) => {
                if (status !== 0) {
                     self.postMessage({ type: 'ERROR', text: `Exited with status ${status}` });
                }
                self.postMessage({ type: 'DONE', output: outputBuffer.join("\n") });
            }
        };

        try {
            importScripts(ngspiceJsUrl);
        } catch (error) {
            self.postMessage({ type: 'ERROR', text: String(error) });
            self.postMessage({ type: 'DONE', output: outputBuffer.join("\n") });
        }
    }
};
