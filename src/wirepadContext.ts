import { boundContains, HandlePoints, Handles, Point, Rect, ResizeHandleInfo } from "./mathUtils";
import { PaintHandler } from "./paintHandler";
import { Painter } from "./paintUtils";
import { KeyboardKeyState, KeyboardKeyStateNames, KeyValuePair } from "./utilities";
import { WirePadEvent } from "./wirepadEvent";

export enum ElementType {
    RECT,
    IMAGE,
    PARAGRAPH,
    HEADING
}

export type WirePadElement = {
    $$guid?: string;
    $$isSelected?: boolean;

    label?:string;
    type:ElementType;
    size: {
        w: number;
        h: number;
    };
    location:{
        x: number;
        y: number;
        a: "left"|"right"|"middle"
    };
    pref?: {[name:string]:string|number|boolean|Array<string|number>}
};

export type WirePadDocument = {
    name:string;
    version:string;
    body:Array<WirePadElement>;
};

export class WirePadContext extends EventTarget{

    public name:string = "unnamed pad";
    public startingContent:string = "";
    private documentData:WirePadDocument = null;

    public selectorHandleShape:"plus"|"cross" = "plus";
    public handleSize:number = 12;

    private paintHandlers:Array<PaintHandler> = [];

    private _pointer:Point = null;
    private _keyStates:KeyboardKeyState = {};

    public settings:KeyValuePair<any> = {
        background: '#adadad'
    };

    private constructor(){
        super();
    }

    public static init(){
        return new WirePadContext();
    }

    public get document():WirePadDocument{
        return {
            name: this.name,
            version: "2.0.1",
            body: this.documentData.body.map(el => {
                let {
                    $$guid,
                    $$isSelected,
                    ...newBody
                } = el;
                return newBody
            })
        }
    }

    public get pointer(): Point{
        return this._pointer ? {
            x: this._pointer.x * window.devicePixelRatio,
            y: this._pointer.y * window.devicePixelRatio
        } : null;
    }

    public get keyState():KeyboardKeyState{
        return this._keyStates;
    }

    public registerPaintHandler(paintHandler: new () => PaintHandler){
        this.paintHandlers.push(new paintHandler);
        return this;
    }

    public setStartingContent(content?:string){
        this.startingContent = String(content ?? "").trim();
    }

    public setDocument(doc:WirePadDocument){
        this.documentData = doc;

        this.documentData.body.forEach(element => {
            if (!element.$$guid) {
                element.$$guid = (<any>[1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            }
            if (element.$$isSelected === undefined || element.$$isSelected === null){
                element.$$isSelected = false;
            }

            element.size = {
                w : Math.abs(element.size.w),
                h : Math.abs(element.size.h)
            };
        });
    }

    public updatePointerLocation(x:number, y:number){
        this._pointer = {x,y};
        return this;
    }

    public updateKeyState(updatedKeyStates:KeyboardKeyState){
        this._keyStates = {
            ...this._keyStates,
            ...updatedKeyStates
        }
        return this;
    }

    public requestPaint(paintContext: CanvasRenderingContext2D){

        let selectedElements:Array<WirePadElement> = [];

        this.documentData.body.forEach(element => {
            let handled:boolean = false;
            if (element.$$isSelected) selectedElements.push(element);

            this.paintHandlers.forEach(h => {
                let res = h.onPaint({
                    paintContext: paintContext,
                    context: this,
                    element: element,
                    handled: handled
                });
                handled = (res !== false);
            });

        });

        let hovered = this.getElementsAtPointer(true);
        if (!this.keyState.alt) hovered.reverse();
        if (hovered.length > 0 && selectedElements.indexOf(hovered[0]) === -1){
            let e = hovered[0];

            Painter.getInstance(paintContext, p => {
                p.rect(
                    e.location.x,
                    e.location.y,
                    e.size.w,
                    e.size.h
                ).drawRect({style:'dodgerblue'});
            });
        }

        let selectionBound = this.getSelectionRect(selectedElements);

        if (selectedElements){
            Painter.getInstance(paintContext, p => {
                p.rect(
                    selectionBound.x,
                    selectionBound.y,
                    selectionBound.w,
                    selectionBound.h
                ).drawRect({style:'deepskyblue'});
            });

            Painter.renderSelectorHandles(paintContext, this.getSelectorHandles({
                rect:selectionBound,
                cursorPosition:this.pointer
            }));
        }

    }

    public isPointerWithinAnyBounds(bounds:Array<Rect>):boolean{
        let pointer = this.pointer;
        return bounds.filter(b => boundContains(pointer, b)).length > 0
    }

    public areAnyElementsAtPointer(elements:Array<WirePadElement>):boolean{
        let pointer = this.pointer;
        return elements.filter(e => boundContains(pointer, {...e.size, ...e.location})).length > 0
    }

    public getElementsAtPointer(withData:boolean=false):Array<WirePadElement>{
        if (this.pointer === null) return [];
        let p = this.pointer;
        return (withData ? this.documentData : this.document).body.filter(e => {
            return boundContains(p, {...e.size, ...e.location});
        });
    }

    public getSelectionRect(elements:Array<WirePadElement>):Rect{
        let r:Partial<Rect> = { x:undefined, y:undefined, h:undefined, w:undefined };

        elements.forEach(e => {
            if (r.x === undefined || e.location.x < r.x) r.x = e.location.x;
            if (r.y === undefined || e.location.y < r.y) r.y = e.location.y;
            if (r.w === undefined || (e.location.x + e.size.w) > (r.x + r.w)) r.w = (e.location.x + e.size.w) - r.x;
            if (r.h === undefined || (e.location.y + e.size.h) > (r.y + r.h)) r.h = (e.location.y + e.size.h) - r.y;
        })

        return <Rect>r;
    }

    public getSelectorHandles(opt:{rect:Rect, cursorPosition:Point}, shape:"plus"|"cross" = this.selectorHandleShape):ResizeHandleInfo{
        let {rect, cursorPosition} = opt;

        let handles:ResizeHandleInfo = {
            [shape === "plus" ? "top" : "topLeft"]: {
                x: shape === "plus" ? rect.x + ((rect.w / 2)) : rect.x,
                y: rect.y
            },
            [shape === "plus" ? "right" : "topRight"]: {
                x: (rect.x + rect.w),
                y: shape === "plus" ? rect.y + (rect.h / 2) : rect.y
            },
            [shape === "plus" ? "bottom" : "bottomRight"]: {
                x: shape === "plus" ? rect.x + (rect.w / 2) : rect.x + rect.w,
                y: (rect.y + rect.h)
            },
            [shape === "plus" ? "left" : "bottomLeft"]: {
                x: (rect.x),
                y: shape === "plus" ? rect.y + (rect.h / 2) : rect.y + rect.h
            },
            size:{
                w: this.handleSize,
                h: this.handleSize
            },
            shape: shape,
            cursor: cursorPosition,
            isHandleActive: false
        };

        let handleNames = <Array<keyof HandlePoints>>[
            (shape === "plus" ? "top" : "topLeft"),
            (shape === "plus" ? "right" : "topRight"),
            (shape === "plus" ? "bottom" : "bottomRight"),
            (shape === "plus" ? "left" : "bottomLeft")
        ];

        handleNames.some((n,i) => {
            let loc = <Point>handles[n];
            if (cursorPosition && boundContains(cursorPosition,{
                x: loc.x - (this.handleSize / 2),
                y: loc.y - (this.handleSize / 2),
                w: this.handleSize, 
                h: this.handleSize
            })){
                handles.isHandleActive = true;
                handles.selectedHandleName = n;
                return true;
            }
        });

        return handles;
    }

    public selectElement(element:WirePadElement, appendSelection:boolean=false){
        if (!element) return this;
        if (appendSelection){
            element.$$isSelected = !element.$$isSelected;
            return this;
        }

        this.documentData.body.forEach(e => e.$$isSelected = (e === element));

        try{
            return this;
        }
        finally{
            this.dispatchEvent(WirePadEvent.init(
                "selectionChanged", 
                this.getSelectedElements()
            ));
        }
    }

    public selectElements(elements:Array<WirePadElement>){
        this.documentData.body.forEach(e => e.$$isSelected = elements.indexOf(e) > -1);

        try{
            return this;
        }
        finally{
            this.dispatchEvent(WirePadEvent.init(
                "selectionChanged", 
                this.getSelectedElements()
            ));
        }
    }

    public getSelectedElements():Array<WirePadElement>{
        return this.documentData.body.filter(e => e.$$isSelected);
    }

    public moveSelection(mover:(loc:Rect)=>Rect|void){
        let selection = this.getSelectedElements();
        if (selection.length === 0) return;
        let originalLocation = this.getSelectionRect(selection);
        let newLocation = {...originalLocation};

        let returnVal = mover(newLocation);
        if (returnVal) newLocation = returnVal;

        selection.forEach(e => {
            let xOffset = newLocation.x - originalLocation.x;
            let yOffset = newLocation.y - originalLocation.y;

            e.location.x += xOffset;
            e.location.y += yOffset;
        });
    }

}