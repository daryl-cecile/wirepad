import { KeyboardKeyState } from "./utilities";

export type KeyboardHelperInputRecord = {
    key: string,
    flags: KeyboardKeyState
};

export class KeyboardHelper {

    private registry:Array<{
        keys:Array<string>,
        flags:KeyboardKeyState,
        callback:(e?:any)=>void
    }> = [];

    private entries:Array<{
        record: KeyboardHelperInputRecord,
        timestamp: number
    }> = [];

    constructor(private timeoutMS:number=240){}

    recordKeyAction(callback:(record:(entry:KeyboardHelperInputRecord)=>void)=>void){
        callback(entry => {
            this.entries.push({
                record: entry,
                timestamp: (new Date()).getTime()
            });

            if (this.entries.length > 15) this.entries.splice(0, this.entries.length - 8); // leave 8

            this.registerPress();
        });
        return this;
    }

    addListener(keys:Array<string>, flags:KeyboardKeyState, callback:(e?:any)=>void){
        this.registry.push({
            keys,
            flags,
            callback
        });
        return this;
    }

    private registerPress(){
        if (this.entries.length === 0) return;

        let pressedFlags = this.entries[this.entries.length - 1].record.flags;

        this.registry.forEach(r => {
            let regFlags:KeyboardKeyState = { //inherit from flags if undefined
                ...r.flags,
                alt: r.flags.alt != "*" ? (r.flags.alt ?? false) : pressedFlags.alt,
                ctrl: r.flags.ctrl != "*" ? (r.flags.ctrl ?? false) : pressedFlags.ctrl,
                meta: r.flags.meta != "*" ? (r.flags.meta ?? false) : pressedFlags.meta,
                shift: r.flags.shift != "*" ? (r.flags.shift ?? false) : pressedFlags.shift,
            }

            let pressedFlagsMapped1 = [Number(pressedFlags.alt ?? "0"), Number(pressedFlags.ctrl ?? "0"), Number(pressedFlags.meta ?? "0"), Number(pressedFlags.shift ?? "0")].join('');
            let flagsMapped2 = [Number(regFlags.alt), Number(regFlags.ctrl), Number(regFlags.meta), Number(regFlags.shift)].join('');

            if (pressedFlagsMapped1 != flagsMapped2) return;

            let e = this.entries.filter(e => e.timestamp >= (new Date()).getTime() - this.timeoutMS);
            if (e.length < r.keys.length) return;
            if (e.length > r.keys.length) e = e.splice(e.length - r.keys.length, r.keys.length);

            let k1 = [...new Set(e.map(e => e.record.key.toLowerCase()).sort())];
            let k2 = [...new Set(r.keys.map(e => e.toLowerCase()).sort())];

            if (k1.join('') != k2.join('')) return;

            r.callback({
                ...pressedFlags
            });
        });

        return this;
    }

}