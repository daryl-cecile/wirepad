import { mergeToStyle } from "./utilities";
import { canvasStyle, hostStyle, resizerStyle } from "./wirepadStyle";
import { HTMLBaseElement } from "./HTMLBaseElement";
import { WirePadEvent } from "./wirepadEvent";
import {  WirePadContext, WirePadDocument } from "./wirepadContext";
import { Size } from "./mathUtils";
import { RectPaintHandler } from "./paintHandlers/rect";
import { InteractionProvider } from "./InteractionProvider";

class WirePad extends HTMLBaseElement{
    static get observedAttributes() { return ["name", "background", "handle:size", "handle:shape"]; }

	protected _shadow:ShadowRoot = null;
    protected context:WirePadContext = WirePadContext.init();

    private _canvas:HTMLCanvasElement = null;
    private _canvasContext:CanvasRenderingContext2D = null;
    private _resizeObserver:HTMLObjectElement = null;

    private _paintCount:number = 0;
    private _telemetryTimerHandle:number = null;
    private interactionProvider:InteractionProvider = null;

    constructor(){
        super();
        
        this._canvas = document.createElement("canvas");
        this._canvasContext = this._canvas.getContext("2d");
        this._resizeObserver = document.createElement("object");

        this.context.registerPaintHandler(RectPaintHandler);

        this.interactionProvider = new InteractionProvider(this._canvas, this.context);
    }

    get document():WirePadDocument{
        return this.context.document;
    }

    attributeChangedCallback(name, oldValue, newValue){
        let isDirty = false;

        if (name === "name"){
            this.context.name = newValue;
            isDirty = true;
        }
        else if (name === "background"){
            this.context.settings['background'] = newValue;
            isDirty = true;
        }
        else if (name.indexOf('_') === 0){
            this.context.settings[name] = newValue;
            isDirty = true;
        }
        else{
            switch (name){
                case "handle:size":
                    this.context.handleSize = Number(newValue);
                    isDirty = true;
                    break;
                case "handle:shape":
                    this.context.selectorHandleShape = newValue;
                    isDirty = true;
                    break;
            }
        }

        if (isDirty) this.paint(this._canvasContext);
    }

    disconnectedCallback(){
        if (this._shadow) {
            this._shadow.innerHTML = "";
        }
        this.endTelemetry();
    }

    childrenAvailableCallback() {
        this.readExistingContent();
        if (this._canvas && !this._canvas.isConnected) this._shadow.appendChild(this._canvas);
        if (this._resizeObserver && !this._resizeObserver.isConnected) this._shadow.appendChild(this._resizeObserver);
        this._shadow.appendChild(mergeToStyle(
            hostStyle,
            canvasStyle,
            resizerStyle
        ));

        this.setupObserver();

        this.setupInteraction();

        this.setupTelemetry();

        this.interactionProvider.setupKeyboardEvent(this);
    }

    private readExistingContent(){
        this.context.setStartingContent(this.innerHTML);
        this.innerHTML = "";
        if (this._shadow === null){
            this._shadow = this.attachShadow({mode:"open"});
        }

        if (this.context.startingContent.length === 0) return;
        try{
            this.context.setDocument( JSON.parse(this.context.startingContent) );
            this.dispatchEvent(WirePadEvent.init("docLoaded"));
        }
        catch (er){
            console.error(er);
            console.warn("Skipping document load");
            this.dispatchEvent(WirePadEvent.init("docLoadFailed"));
        }
    }

    private resize(){
        let rect = this._resizeObserver.getBoundingClientRect();

        this._canvas.width = rect.width * window.devicePixelRatio;
        this._canvas.height = rect.height * window.devicePixelRatio;
        this._canvas.style.width = `${rect.width}px`;
        this._canvas.style.height = `${rect.height}px`;

        this.context.settings["size"] = {
            w: this._canvas.width,
            h: this._canvas.height
        };
        
        this.dispatchEvent(WirePadEvent.init("resize"));

        this.paint(this._canvasContext);
    }

    private paint(canvasContext:CanvasRenderingContext2D){
        requestAnimationFrame(()=>{
            let canvasSize:Size = this.context.settings['size'];
            if (!canvasSize) return this.resize();

            canvasContext.clearRect(0, 0, canvasSize.w, canvasSize.h);
            canvasContext.fillStyle = this.context.settings['background'];
            canvasContext.fillRect(0, 0 , canvasSize.w, canvasSize.h);
    
            this.context.requestPaint(canvasContext);
            
            this.dispatchEvent(WirePadEvent.init("paint"));
    
            this._paintCount ++;
        });
    }

    private setupInteraction(){

        this.interactionProvider.start();
        this.interactionProvider.on("paintRequest", ()=> this.paint(this._canvasContext));

        let {keyboard} = this.interactionProvider;

        keyboard.addListener(["arrowLeft"], {shift:'*'}, flags => {
            this.context.moveSelection(loc => {
                loc.x -= flags.shift ? (2 * window.devicePixelRatio) : window.devicePixelRatio;
            });
            this.paint(this._canvasContext);
        });

        keyboard.addListener(["arrowRight"], {shift:'*'}, flags => {
            this.context.moveSelection(loc => {
                loc.x += flags.shift ? (2 * window.devicePixelRatio) : window.devicePixelRatio;
            });
            this.paint(this._canvasContext);
        });

        keyboard.addListener(["arrowUp"], {shift:'*'}, flags => {
            this.context.moveSelection(loc => {
                loc.y -= flags.shift ? (2 * window.devicePixelRatio) : window.devicePixelRatio;
            });
            this.paint(this._canvasContext);
        });

        keyboard.addListener(["arrowDown"], {shift:'*'}, flags => {
            this.context.moveSelection(loc => {
                loc.y += flags.shift ? (2 * window.devicePixelRatio) : window.devicePixelRatio;
            });
            this.paint(this._canvasContext);
        });

        keyboard.addListener(["arrowDown"], {meta:true, shift:'*'}, flags => {
            let elements = this.context.getSelectedElements().reverse();

            elements.forEach(e => {
                let o = this.context.getElementOrder(e);
                if (flags.shift) this.context.changeElementOrder(o, 0);
                else if (o > 0) this.context.changeElementOrder(o, o-1);
            });

            this.paint(this._canvasContext);
        });

        keyboard.addListener(["arrowUp"], {meta:true, shift:'*'}, flags => {
            let elements = this.context.getSelectedElements().reverse();
            let totalElementCount = this.context.getElementCount();

            elements.forEach(e => {
                let o = this.context.getElementOrder(e);
                if (flags.shift) this.context.changeElementOrder(o, totalElementCount - 1);
                else if (o < totalElementCount - 1) this.context.changeElementOrder(o, o+1);
            });
            
            this.paint(this._canvasContext);
        });

        keyboard.addListener(["x"], {alt: true}, () => {
            let elementsAtPointer = this.context.getElementsAtPointer(true);
            let newX = (this.clientWidth / 2) * window.devicePixelRatio;
            if (elementsAtPointer.length > 0) newX = elementsAtPointer[0].location.x + (elementsAtPointer[0].size.w / 2);
            this.context.moveSelection(loc => {
                loc.x = (newX) - (loc.w / 2);
            });
            this.paint(this._canvasContext);
        });

        keyboard.addListener(["y"], {alt: true}, () => {
            let elementsAtPointer = this.context.getElementsAtPointer(true);
            let newY = (this.clientHeight / 2) * window.devicePixelRatio;
            if (elementsAtPointer.length > 0) newY = elementsAtPointer[0].location.y + (elementsAtPointer[0].size.h / 2);
            this.context.moveSelection(loc => {
                loc.y = (newY) - (loc.h / 2);
            });
            this.paint(this._canvasContext);
        });

        keyboard.addListener(["backspace"], {}, ()=>{
            this.context.getSelectedElements().forEach(e => this.context.deleteElement(e));
            this.paint(this._canvasContext);
        });

        keyboard.addListener(["delete"], {}, ()=>{
            this.context.getSelectedElements().forEach(e => this.context.deleteElement(e));
            this.paint(this._canvasContext);
        });

    }

    private setupObserver(){
        this._resizeObserver.onload = ()=>{
            this._resizeObserver.contentDocument.defaultView.addEventListener('resize', this.resize.bind(this));
            this.doCanvasWork(_ => this.resize())
        }
        this._resizeObserver.type = 'text/html';
        this._resizeObserver.data = 'about:blank';
    }

    private setupTelemetry(){
        this._telemetryTimerHandle = setInterval(()=>{
            let pc = this._paintCount;
            this._paintCount = 0;
            this.dispatchEvent(WirePadEvent.init("telemetry", { 
                paintCount: pc,
                objectCount: this.context.document.body.length
            }));
        }, 1000);
    }

    private endTelemetry(){
        if (this._telemetryTimerHandle !== null) {
            clearTimeout(this._telemetryTimerHandle);
            this._telemetryTimerHandle = null;
        }
    }

    doCanvasWork(workHandler:(context:CanvasRenderingContext2D)=>void){
        requestAnimationFrame(()=>{
            workHandler(this._canvasContext);
        });
    }

}

window.customElements.define("pf-wirepad", WirePad);