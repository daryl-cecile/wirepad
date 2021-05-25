import { Handles, Rect, ResizeHandleInfo, Size } from "./mathUtils";

export class Painter{

    private canvasBounds:DOMRect = null;

    private flags = {
        hasStroke: false,
        hasFill: false
    };

    private mem = {
        x:null,
        y:null,
        w:null,
        h:null,
        r:null
    };

    static getInstance(canvasContext:CanvasRenderingContext2D, callback?:(painter:Painter)=>void){
        let p = new Painter(canvasContext);
        if (callback){
            callback(p);
            p.end();
        }
        return p;
    }

    static renderSelectorHandles(canvasContext:CanvasRenderingContext2D, selectorHandles:ResizeHandleInfo){
        let p = new Painter(canvasContext);

        let {size,cursor,selectedHandleName,isHandleActive, ...handles} = selectorHandles;

        for (let [n, h] of Object.entries(handles)){
            p.circle(h.x, h.y, size.w / 2).fillCircle({style: n!==selectedHandleName ? 'deepskyblue' :'deeppink' });
        }

        p.end();
    }

    constructor(private context:CanvasRenderingContext2D){
        this.canvasBounds = this.context.canvas.getBoundingClientRect();
    }

    rect(x:number, y:number, w:number, h:number){
        this.mem = {
            ...this.mem,
            x,y,w,h
        };
        return this;
    }

    circle(cx:number, cy:number, radius:number){
        this.mem = {
            ...this.mem,
            x: cx,
            y: cy,
            r: radius
        };
        return this;
    }

    fillCircle(opt?:{style?: string | CanvasGradient | CanvasPattern}){
        if (opt?.style) this.context.fillStyle = opt.style;
        this.context.beginPath();
        this.context.arc(this.mem.x, this.mem.y, this.mem.r, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.fill();
        return this;
    }

    drawCircle(opt?:{style?: string | CanvasGradient | CanvasPattern, autoStroke?:boolean}){
        if (opt?.style) this.context.strokeStyle = opt.style;
        this.context.beginPath();
        this.context.arc(this.mem.x, this.mem.y, this.mem.r, 0, 2 * Math.PI);
        this.flags.hasStroke = (opt?.autoStroke !== true);
        if (opt?.autoStroke) this.context.stroke();
        
        return this;
    }

    drawRect(opt?:{style?: string | CanvasGradient | CanvasPattern, autoStroke?:boolean}){
        if (opt?.style) this.context.strokeStyle = opt.style;
        this.context.beginPath();
        this.context.rect(this.mem.x, this.mem.y, this.mem.w, this.mem.h);
        this.flags.hasStroke = (opt?.autoStroke !== true);
        if (opt?.autoStroke) this.context.stroke();
        
        return this;
    }

    fillRect(opt?:{style?: string | CanvasGradient | CanvasPattern}){
        if (opt?.style) this.context.fillStyle = opt.style;
        this.context.fillRect(this.mem.x, this.mem.y, this.mem.w, this.mem.h);
        return this;
    }

    end(){
        if (this.flags.hasStroke) this.context.stroke();
        if (this.flags.hasFill) this.context.fill();
    }

}