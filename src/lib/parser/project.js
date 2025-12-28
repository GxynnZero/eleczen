/**
 * EZP (ElecZen Project) DSL Parser and Generator
 * Format designed to be human-readable and git-friendly.
 */

export const parseEZC = (content) => {
    const lines = content.split(/\r?\n/);
    const result = {
        meta: {},
        pins: []
    };
    let context = 'ROOT';
    let currentItem = null;

    const parseValue = (val) => {
        if (!val) return null;
        if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
        if (val === 'true') return true;
        if (val === 'false') return false;
        if (!isNaN(parseFloat(val))) return parseFloat(val);
        return val;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;
        const tokens = line.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        if (tokens.length === 0) continue;
        const keyword = tokens[0];

        if (keyword === 'end') {
            if (context === 'PINS') context = 'COMPONENT';
            else if (context === 'META') context = 'COMPONENT';
            else if (context === 'COMPONENT') context = 'ROOT';
            continue;
        }

        if (context === 'ROOT') {
            if (keyword === 'component') {
                result.name = parseValue(tokens[1]);
                context = 'COMPONENT';
            }
        } else if (context === 'COMPONENT') {
            if (keyword === 'version') result.version = parseValue(tokens[1]);
            else if (keyword === 'kind') result.kind = parseValue(tokens[1]);
            else if (keyword === 'category') result.category = parseValue(tokens[1]);
            else if (keyword === 'meta') context = 'META';
            else if (keyword === 'pins') context = 'PINS';
        } else if (context === 'META') {
            if (tokens.length >= 2) {
                if (line.includes('[')) {
                    const match = line.match(/\[(.*?)\]/);
                    if (match) {
                        const parts = match[1].split(',').map(s => s.trim().replace(/"/g, ''));
                        result.meta[keyword] = parts;
                    }
                } else {
                    result.meta[keyword] = parseValue(tokens[1]);
                }
            }
        } else if (context === 'PINS') {
            if (keyword === 'pin') {
                const name = parseValue(tokens[1]);
                const pin = { name };
                for (let j = 2; j < tokens.length; j += 2) {
                    if (tokens[j] && tokens[j + 1]) {
                        pin[tokens[j]] = parseValue(tokens[j + 1]);
                    }
                }
                result.pins.push(pin);
            }
        }
    }
    return result;
};

export const parseEZL = (content) => {
    const lines = content.split(/\r?\n/);
    const result = {
        meta: {},
        submodels: []
    };
    let context = 'ROOT';
    let heredocMarker = null;
    let heredocContent = '';

    const parseValue = (val) => {
        if (!val) return null;
        if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
        return val;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (heredocMarker) {
            if (line.includes(heredocMarker)) {
                result.submodels.push(heredocContent);
                heredocMarker = null;
                heredocContent = '';
            } else {
                heredocContent += lines[i] + '\n';
            }
            continue;
        }

        if (!line || line.startsWith('#') || line.startsWith('//')) continue;
        const tokens = line.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        if (tokens.length === 0) continue;
        const keyword = tokens[0];

        if (keyword === 'end') {
            context = 'ROOT';
            continue;
        }

        if (context === 'ROOT') {
            if (keyword === 'library') {
                result.name = parseValue(tokens[1]);
                context = 'LIBRARY';
            }
        } else if (context === 'LIBRARY') {
            if (keyword === 'submodel') {
                if (tokens[1] && tokens[1].startsWith('<<')) {
                    heredocMarker = tokens[1].substring(2);
                }
            }
        }
    }
    return result;
};

export const parseEZP = (content) => {
    const lines = content.split(/\r?\n/);
    const result = {
        meta: {},
        components: [],
        wires: []
    };

    let context = ['ROOT']; // Stack: ROOT -> PROJECT -> (COMPONENT|WIRE|META|CONFIG|VIEWPORT)
    let currentItem = null;

    const parseValue = (val) => {
        if (!val) return null;
        if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
        // Try to identify array pattern even if it has spaces or newlines
        if (val.trim().startsWith('[') && val.trim().endsWith(']')) {
            try {
                // Try parsing as-is first (standard JSON)
                return JSON.parse(val);
            } catch (e1) {
                try {
                    // Replace single quotes with double quotes for mixed format
                    // IMPORTANT: Only replace quotes that wrap keys/values, not inside strings if possible
                    // But simpler: just replace all ' with "
                    const jsonStr = val.replace(/'/g, '"');
                    return JSON.parse(jsonStr);
                } catch (e2) {
                    console.error("JSON Parse Error on:", val, "Error:", e2.message);
                    return val;
                }
            }
        }
        if (val.startsWith('[')) {
            // It might be an array spread across multiple lines or tokens
            // This basic lexer doesn't handle multi-line values well yet without lookahead.
            // For now, assume single-line array strings.
            // If we caught the start but not end, it might be a tokenization issue (spaces inside array)
            // We need to re-join the tokens if we are calling from the switch case
        }
        if (!isNaN(parseFloat(val))) return parseFloat(val);
        if (val === 'true') return true;
        if (val === 'false') return false;
        return val;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;

        // Tokenize: handle quotes
        const tokens = [];
        let currentToken = '';
        let inQuote = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuote = !inQuote;
                currentToken += char;
            } else if (char === ' ' && !inQuote) {
                if (currentToken) tokens.push(currentToken);
                currentToken = '';
            } else {
                currentToken += char;
            }
        }
        if (currentToken) tokens.push(currentToken);

        const keyword = tokens[0];
        const currentContext = context[context.length - 1];

        if (keyword === 'end') {
            context.pop();
            currentItem = null; // simplified logic, might need stack for items too if nested deeply
            continue;
        }

        switch (currentContext) {
            case 'ROOT':
                if (keyword === 'project') {
                    result.title = parseValue(tokens[1]);
                    context.push('PROJECT');
                }
                break;

            case 'PROJECT':
                if (keyword === 'version') result.version = parseValue(tokens[1]);
                else if (keyword === 'meta') {
                    context.push('META');
                }
                else if (keyword === 'config') {
                    context.push('CONFIG');
                    result.config = {};
                }
                else if (keyword === 'component') {
                    currentItem = { id: parseValue(tokens[1]), properties: {} };
                    result.components.push(currentItem);
                    context.push('COMPONENT');
                }
                else if (keyword === 'wire') {
                    currentItem = { id: parseValue(tokens[1]), points: [] };
                    result.wires.push(currentItem);
                    context.push('WIRE');
                }
                break;

            case 'CONFIG':
                if (keyword === 'viewport') {
                    context.push('VIEWPORT');
                    result.config.viewport = {};
                }
                else if (keyword === 'grid') result.config.grid = parseValue(tokens[1]);
                break;

            case 'VIEWPORT':
                if (tokens.length >= 2) {
                    result.config.viewport[keyword] = parseValue(tokens[1]);
                }
                break;

            case 'META':
                if (tokens.length >= 2) {
                    result.meta[keyword] = parseValue(tokens[1]);
                }
                break;

            case 'COMPONENT':
                if (keyword === 'properties') {
                    context.push('PROPERTIES');
                }
                else if (keyword === 'customPorts') {
                    // Reconstruct the array string from rest of tokens to handle spaces like ["A", "B"]
                    // slice(1) gets everything after 'customPorts'
                    // We need to fetch the original line part or join tokens carefully
                    // Since tokens were split by space but strings preserved, simple join might work 
                    // providing we respect the token separation.
                    // However, our tokenizer combined quoted strings.

                    // Let's just grab the part of the line after 'customPorts'
                    const lineContent = line.substring(line.indexOf('customPorts') + 11).trim();
                    currentItem.customPorts = parseValue(lineContent);
                }
                else if (tokens.length >= 2) {
                    currentItem[keyword] = parseValue(tokens[1]);
                }
                break;

            case 'PROPERTIES':
                if (tokens.length >= 2) {
                    currentItem.properties[keyword] = parseValue(tokens[1]);
                }
                break;

            case 'WIRE':
                if (tokens.length >= 2) {
                    if (keyword === 'points') {
                        // specialized array parsing for points [[x,y], [x,y]]
                        // The JSON.parse in parseValue might handle it if formatted strictly
                        // otherwise we might need more robust parsing.
                        // For now assuming strictly JSON-compatible format in value.
                        currentItem[keyword] = parseValue(tokens.slice(1).join(' '));
                    } else {
                        currentItem[keyword] = parseValue(tokens[1]);
                    }
                }
                break;
        }
    }

    return result;
};

export const generateEZP = (project) => {
    let out = `project "${project.title || 'Untitled'}"\n`;
    if (project.version) out += `    version "${project.version}"\n`;

    out += `\n    meta\n`;
    for (const [k, v] of Object.entries(project.meta || {})) {
        out += `        ${k} "${v}"\n`;
    }
    out += `    end\n`;



    if (project.config) {
        out += `\n    config\n`;
        if (project.config.grid !== undefined) out += `        grid ${project.config.grid}\n`;
        if (project.config.viewport) {
            out += `        viewport\n`;
            out += `            x ${project.config.viewport.x || 0}\n`;
            out += `            y ${project.config.viewport.y || 0}\n`;
            out += `            zoom ${project.config.viewport.zoom || 1}\n`;
            out += `        end\n`;
        }
        out += `    end\n`;
    }

    out += `\n`;

    project.components.forEach(c => {
        out += `    component "${c.id}"\n`;
        out += `        type ${c.type}\n`;
        if (c.x !== undefined) out += `        x ${c.x}\n`;
        if (c.y !== undefined) out += `        y ${c.y}\n`;
        if (c.rotation !== undefined) out += `        rotation ${c.rotation}\n`;
        if (c.customPorts) out += `        customPorts ${JSON.stringify(c.customPorts)}\n`;

        if (c.properties && Object.keys(c.properties).length > 0) {
            out += `        properties\n`;
            for (const [k, v] of Object.entries(c.properties)) {
                const val = typeof v === 'string' ? `"${v}"` : v;
                out += `            ${k} ${val}\n`;
            }
            out += `        end\n`;
        }
        out += `    end\n\n`;
    });

    project.wires.forEach(w => {
        out += `    wire "${w.id}"\n`;
        out += `        fromComp "${w.fromComp}"\n`;
        out += `        toComp "${w.toComp}"\n`;
        out += `        fromPort "${w.fromPort}"\n`;
        out += `        toPort "${w.toPort}"\n`;
        if (w.points) {
            out += `        points ${JSON.stringify(w.points)}\n`;
        }
        out += `    end\n\n`;
    });

    out += `end\n`;
    return out;
};
