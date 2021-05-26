
export type StyleObject = {
    [selector:string]:Partial<CSSStyleDeclaration>
}

export function styleToCSS(styleObject:StyleObject, pretty:boolean=false):string{

    let outputStyle = '';

    const NEWLINE = pretty ? '\n' : '';
    const INDENT = pretty ? '\t' : '';

    Object.keys(styleObject).forEach(selector => {
        outputStyle += `${normalizePropertyName(selector, true)}{` + NEWLINE;
        Object.entries(styleObject[selector]).forEach(([propertyName, value]) => {   
            let propName = normalizePropertyName(propertyName);
            
            outputStyle += INDENT;
            outputStyle += `${propName}: ${value};` + NEWLINE;
        });
        outputStyle += '}';

        if (pretty) outputStyle + '\n\n';
    });
    
    return outputStyle;

}

export function styleBlock(selector:string, body:Partial<CSSStyleDeclaration>){
    return styleToCSS({
        [selector]:body
    });
}

export function normalizePropertyName(propName:string, parseSelector:boolean=false){

    let finalPropertyName:string;

    if (parseSelector){
        finalPropertyName = propName;
        finalPropertyName = finalPropertyName.split(' ').map(p => {
            if (p === 'host') return ':host';
            return p;
        }).join(' ');
    }
    else{
        finalPropertyName = propName.replace('__', '--');
        finalPropertyName = finalPropertyName.replace(/[A-Z]/gm, v => `-${v.toLowerCase()}`);
    }

    return finalPropertyName;

}

export function mergeToStyle(...parts:Array<string>){
    let style = document.createElement("style");
    style.innerHTML = parts.join('\n\n');
    return style;
}

export type KeyValuePair<V> = {
    [key:string] : V
};

export type KeyboardKeyState = {
    alt?: boolean | "*";
    ctrl?: boolean | "*";
    meta?: boolean | "*";
    shift?: boolean | "*";
}

export type KeyboardKeyStateNames = keyof KeyboardKeyState;

export const throttle = (()=>{
    let cache = {};

    return function runAction<R=any>(action:(...args:any)=>R){
        let key = action.toString();
        if (!!cache[key]) return;
        setTimeout(()=>{ cache[key] = false; }, 50);
        cache[key] = true;
        action();
    }
})();

export class Collection<T = any> extends Array<T>{
    static From<T>(arr:Array<T>){
        let c = new Collection();
        c.push(...arr);
        return c;
    }

    get lastItem(){
        return this[this.length - 1];
    }
}