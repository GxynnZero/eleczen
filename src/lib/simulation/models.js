/**
 * Component Models for Result Mapping
 * Defines how to calculate component state from simulation results.
 */

export const Models = {
    resistor: {
        type: 'passive',
        calculateState: (vDiff, i, p) => ({ voltage: vDiff, current: i, power: p })
    },

    battery: {
        type: 'voltage_source',
        calculateState: (vDiff, i, p) => ({ voltage: vDiff, current: i, power: p })
    },

    capacitor: {
        type: 'passive',
        calculateState: (vDiff, i, p) => ({ voltage: vDiff, current: i, power: p })
    },

    inductor: {
        type: 'passive',
        calculateState: (vDiff, i, p) => ({ voltage: vDiff, current: i, power: p })
    },

    led: {
        type: 'diode',
        calculateState: (vDiff) => {
            const Vf = 1.8;
            const active = vDiff > Vf;
            const brightness = active ? Math.min(1, Math.max(0, (vDiff - Vf) / 1.0)) : 0;
            return { active, brightness, voltage: vDiff };
        }
    },

    transistor: {
        type: 'bjt',
        calculateState: (vDiff, i, p, vBE, vCE) => ({
            active: vBE > 0.6,
            vBE, vCE
        })
    },

    mosfet: {
        type: 'mosfet',
        calculateState: (vDiff, i, p, vGS, vDS) => ({
            active: vGS > 2.0,
            vGS, vDS
        })
    },

    switch: {
        type: 'passive',
        calculateState: (vDiff) => ({ voltage: vDiff })
    }
};