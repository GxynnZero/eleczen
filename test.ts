import { NgspiceEngine } from "./luttice/simulation/engine/index.ts";

const run = new NgspiceEngine();
run.setNetList(`V1 N001 0 5
C1 0 N002 1µ
R1 N002 N001 1k
.tran .1u 10m uic
.end
`);
async function init() {
    const res = await run.runSim()
    console.log(JSON.stringify(res));
}
init();

// .tran <tstep> <tstop> [tstart] [tmax] [uic]