import { boundContains, HandlePoints, Handles, Rect, ResizeHandleInfo } from "./mathUtils";
import { Collection, throttle } from "./utilities";
import { WirePadContext, WirePadElement } from "./wirepadContext";
import { WirePadEvent } from "./wirepadEvent";

export class InteractionProvider extends EventTarget{

    private eventTarget:EventTarget = new EventTarget();

    constructor(private canvas:HTMLCanvasElement, private wirepadContext:WirePadContext){
        super();

        wirepadContext.addEventListener("selectionChanged", (e:WirePadEvent) => {
            this.eventTarget.dispatchEvent(WirePadEvent.init("selectionChanged", e.payload));
        });
    }

    start(){

        let isMouseDown:boolean = false;
        let isDragging:boolean = false;

        // let selectedElement:WirePadElement;
        let selectionRect:Rect;
        let selectHandles:ResizeHandleInfo;
        let activeSelectHandleName: keyof HandlePoints;

        let snapshot = {
            xMouseAtActionStart: 0,
            yMouseAtActionStart: 0,

            selectionRect:{
                x:0,
                y:0,
                w:0,
                h:0
            }
        };

        this.canvas.addEventListener('mousemove', e => {
            this.wirepadContext.updatePointerLocation(e.offsetX, e.offsetY);
            this.wirepadContext.updateKeyState({
                alt: e.altKey,
                meta: e.metaKey,
                ctrl: e.ctrlKey,
                shift: e.shiftKey
            });

            throttle(()=>{
                if (isMouseDown) isDragging = true;

                this.eventTarget.dispatchEvent(WirePadEvent.init("mouseMove", {originalEvent: e}));

                this.wirepadContext.selectorHandleShape = (e.metaKey && e.shiftKey) ? 'cross' : 'plus';

                if (selectionRect){
                    if (isDragging && selectHandles){

                        let selectedItems = this.wirepadContext.getSelectedElements();
    
                        switch (activeSelectHandleName){
                            case "right":{
                                let xMouseDiff = this.wirepadContext.pointer.x - (selectionRect.x + selectionRect.w);
    
                                let newRect:Rect = {
                                    ...selectionRect,
                                    w: selectionRect.w + xMouseDiff
                                }
    
                                selectedItems.forEach(e => {
                                    let elementWidthPercentOld = e.size.w / selectionRect.w;
                                    let elementStartPercentOld = (e.location.x - selectionRect.x) / selectionRect.w;
                                    e.size.w = newRect.w * elementWidthPercentOld;
                                    if (elementStartPercentOld !== 0) e.location.x = (newRect.w * elementStartPercentOld) + selectionRect.x;
                                });
                                break;
                            }
                            case "left":{
                                let xMouseDiff = this.wirepadContext.pointer.x - selectionRect.x;
    
                                let newRect:Rect = {
                                    ...selectionRect,
                                    w: selectionRect.w - xMouseDiff,
                                    x: selectionRect.x + xMouseDiff
                                }
    
                                selectedItems.forEach(e => {
                                    let elementWidthPercentOld = e.size.w / selectionRect.w;
                                    let elementStartPercentOld = (e.location.x - selectionRect.x) / selectionRect.w;
    
                                    e.size.w = newRect.w * elementWidthPercentOld;
                                    if (elementStartPercentOld !== 0) e.location.x = (newRect.w * elementStartPercentOld) + selectionRect.x;
                                    e.location.x += xMouseDiff
                                });
                                break;
                            }
                            case "bottom":{
                                let yMouseDiff = this.wirepadContext.pointer.y - (selectionRect.y + selectionRect.h);
    
                                let newRect:Rect = {
                                    ...selectionRect,
                                    h: selectionRect.h + yMouseDiff
                                }
    
                                selectedItems.forEach(e => {
                                    let elementHeightPercentOld = e.size.h / selectionRect.h;
                                    let elementStartPercentOld = (e.location.y - selectionRect.y) / selectionRect.h;
                                    e.size.h = newRect.h * elementHeightPercentOld;
                                    if (elementStartPercentOld !== 0) e.location.y = (newRect.h * elementStartPercentOld) + selectionRect.y;
                                });
                                break;
                            }
                            case "top":{
                                let yMouseDiff = this.wirepadContext.pointer.y - selectionRect.y;
    
                                let newRect:Rect = {
                                    ...selectionRect,
                                    h: selectionRect.h - yMouseDiff,
                                    y: selectionRect.y + yMouseDiff
                                }
    
                                selectedItems.forEach(e => {
                                    let elementHeightPercentOld = e.size.h / selectionRect.h;
                                    let elementEndPercentOld = (e.location.y - selectionRect.y) / selectionRect.h;
    
                                    e.size.h = newRect.h * elementHeightPercentOld;
                                    if (elementEndPercentOld !== 0) e.location.y = (newRect.h * elementEndPercentOld) + selectionRect.y;
                                    e.location.y += yMouseDiff
                                });
                                break;
                            }
                            case "topRight":{
                                let yMouseDiff = this.wirepadContext.pointer.y - selectionRect.y;
                                let xMouseDiff = this.wirepadContext.pointer.x - (selectionRect.x + selectionRect.w);
    
                                let newRect:Rect = {
                                    ...selectionRect,
                                    h: selectionRect.h - yMouseDiff,
                                    y: selectionRect.y + yMouseDiff,
                                    w: selectionRect.w + xMouseDiff
                                }
    
                                selectedItems.forEach(e => {
                                    let elementHeightPercentOld = e.size.h / selectionRect.h;
                                    let elementEndPercentOld = (e.location.y - selectionRect.y) / selectionRect.h;
                                    let elementWidthPercentOld = e.size.w / selectionRect.w;
                                    let elementStartPercentOld = (e.location.x - selectionRect.x) / selectionRect.w;
                                    e.size.w = newRect.w * elementWidthPercentOld;
                                    e.size.h = newRect.h * elementHeightPercentOld;
                                    if (elementStartPercentOld !== 0) e.location.x = (newRect.w * elementStartPercentOld) + selectionRect.x;
                                    if (elementEndPercentOld !== 0) e.location.y = (newRect.h * elementEndPercentOld) + selectionRect.y;
                                    e.location.y += yMouseDiff
                                });
                                break;
                            }
                            case "topLeft":{
                                let xMouseDiff = this.wirepadContext.pointer.x - selectionRect.x;
                                let yMouseDiff = this.wirepadContext.pointer.y - selectionRect.y;
    
                                let newRect:Rect = {
                                    ...selectionRect,
                                    w: selectionRect.w - xMouseDiff,
                                    x: selectionRect.x + xMouseDiff,
                                    h: selectionRect.h - yMouseDiff,
                                    y: selectionRect.y + yMouseDiff
                                }
    
                                selectedItems.forEach(e => {
                                    let elementHeightPercentOld = e.size.h / selectionRect.h;
                                    let elementEndPercentOld = (e.location.y - selectionRect.y) / selectionRect.h;
    
                                    e.size.h = newRect.h * elementHeightPercentOld;
                                    if (elementEndPercentOld !== 0) e.location.y = (newRect.h * elementEndPercentOld) + selectionRect.y;
                                    e.location.y += yMouseDiff;

                                    let elementWidthPercentOld = e.size.w / selectionRect.w;
                                    let elementStartPercentOld = (e.location.x - selectionRect.x) / selectionRect.w;
    
                                    e.size.w = newRect.w * elementWidthPercentOld;
                                    if (elementStartPercentOld !== 0) e.location.x = (newRect.w * elementStartPercentOld) + selectionRect.x;
                                    e.location.x += xMouseDiff
                                });
                                break;
                            }
                            case "bottomLeft":{
                                let xMouseDiff = this.wirepadContext.pointer.x - selectionRect.x;
                                let yMouseDiff = this.wirepadContext.pointer.y - (selectionRect.y + selectionRect.h);
    
                                let newRect:Rect = {
                                    ...selectionRect,
                                    w: selectionRect.w - xMouseDiff,
                                    x: selectionRect.x + xMouseDiff,
                                    h: selectionRect.h + yMouseDiff
                                }
    
                                selectedItems.forEach(e => {
                                    let elementHeightPercentOld = e.size.h / selectionRect.h;
                                    let elementEndPercentOld = (e.location.y - selectionRect.y) / selectionRect.h;
                                    e.size.h = newRect.h * elementHeightPercentOld;
                                    if (elementEndPercentOld !== 0) e.location.y = (newRect.h * elementEndPercentOld) + selectionRect.y;
                                
                                    let elementWidthPercentOld = e.size.w / selectionRect.w;
                                    let elementStartPercentOld = (e.location.x - selectionRect.x) / selectionRect.w;
    
                                    e.size.w = newRect.w * elementWidthPercentOld;
                                    if (elementStartPercentOld !== 0) e.location.x = (newRect.w * elementStartPercentOld) + selectionRect.x;
                                    e.location.x += xMouseDiff
                                });
                                break;
                            }
                            case "bottomRight":{
                                let xMouseDiff = this.wirepadContext.pointer.x - (selectionRect.x + selectionRect.w);
                                let yMouseDiff = this.wirepadContext.pointer.y - (selectionRect.y + selectionRect.h);
    
                                let newRect:Rect = {
                                    ...selectionRect,
                                    w: selectionRect.w + xMouseDiff,
                                    h: selectionRect.h + yMouseDiff
                                }
    
                                selectedItems.forEach(e => {
                                    let elementHeightPercentOld = e.size.h / selectionRect.h;
                                    let elementEndPercentOld = (e.location.y - selectionRect.y) / selectionRect.h;
                                    e.size.h = newRect.h * elementHeightPercentOld;
                                    if (elementEndPercentOld !== 0) e.location.y = (newRect.h * elementEndPercentOld) + selectionRect.y;
                                
                                    let elementWidthPercentOld = e.size.w / selectionRect.w;
                                    let elementStartPercentOld = (e.location.x - selectionRect.x) / selectionRect.w;
                                    e.size.w = newRect.w * elementWidthPercentOld;
                                    if (elementStartPercentOld !== 0) e.location.x = (newRect.w * elementStartPercentOld) + selectionRect.x;
                                });
                                break;
                            }
                            case undefined:{
                                let xMouseDiff = this.wirepadContext.pointer.x - snapshot.xMouseAtActionStart;
                                let yMouseDiff = this.wirepadContext.pointer.y - snapshot.yMouseAtActionStart;
    
                                let newRect:Rect = {
                                    ...selectionRect,
                                    x: snapshot.selectionRect.x + xMouseDiff,
                                    y: snapshot.selectionRect.y + yMouseDiff
                                };

                                selectedItems.forEach(e => {
                                    let xOffsetFromSelection = e.location.x - selectionRect.x;
                                    let yOffsetFromSelection = e.location.y - selectionRect.y;

                                    e.location.x = newRect.x + xOffsetFromSelection;
                                    e.location.y = newRect.y + yOffsetFromSelection;
                                });
                            }
                        }
    
                        selectionRect = this.wirepadContext.getSelectionRect(selectedItems);
                        if (activeSelectHandleName === undefined && selectedItems.length > 0){
                            if (!boundContains(this.wirepadContext.pointer, selectionRect)) {
                                this.wirepadContext.selectElements([]);
                            };
                        }
                    }

                }

                this.eventTarget.dispatchEvent(WirePadEvent.init("paintRequest"));
            });
        });

        this.canvas.addEventListener('click', e => {
            if (isDragging) return;
            this.eventTarget.dispatchEvent(WirePadEvent.init("click", {originalEvent: e}));
            this.wirepadContext.updatePointerLocation(e.offsetX, e.offsetY);

            let elementsAtPointer = this.wirepadContext.getElementsAtPointer(true);
            if (!e.altKey) elementsAtPointer.reverse();
            console.log({m:e.metaKey,elementsAtPointer});
            this.wirepadContext.selectElement(elementsAtPointer[0], e.metaKey); // if key cmd is pressed, set appendSelection to true
            
            this.eventTarget.dispatchEvent(WirePadEvent.init("paintRequest"));
        });

        this.canvas.addEventListener('mousedown', e => {
            isMouseDown = true;

            let position = this.wirepadContext.pointer;

            let elementsAtPointer = this.wirepadContext.getElementsAtPointer(true);

            let selectedElements = this.wirepadContext.getSelectedElements();
            let pointerIsInBounds = this.wirepadContext.isPointerWithinAnyBounds(selectedElements.map(e => {
                return {
                    x: e.location.x - (this.wirepadContext.handleSize / 2),
                    y: e.location.y - (this.wirepadContext.handleSize / 2),
                    w: e.size.w + this.wirepadContext.handleSize,
                    h: e.size.h + this.wirepadContext.handleSize,
                }
            }));

            if (elementsAtPointer.length > 0){}
            else if (selectedElements.length > 0 && !pointerIsInBounds){
                selectedElements.forEach(e => e.$$isSelected = false);
            }

            if (selectedElements.length === 0) return;

            selectionRect = this.wirepadContext.getSelectionRect(selectedElements);

            snapshot.xMouseAtActionStart = this.wirepadContext.pointer.x;
            snapshot.yMouseAtActionStart = this.wirepadContext.pointer.y;
            snapshot.selectionRect = selectionRect;

            selectHandles = this.wirepadContext.getSelectorHandles({
                rect: selectionRect,
                cursorPosition: position
            });

            activeSelectHandleName = selectHandles.selectedHandleName ?? undefined;

        });

        const revertState = ()=>setTimeout(()=>{ isMouseDown = false; isDragging = false }, 0);

        this.canvas.addEventListener('mouseup', revertState);
        this.canvas.addEventListener('mouseleave', revertState);
        this.canvas.addEventListener('mouseout', revertState);

        this.canvas.addEventListener('keydown', e => {
            this.wirepadContext.updateKeyState({
                alt: e.altKey,
                meta: e.metaKey,
                ctrl: e.ctrlKey,
                shift: e.shiftKey
            });
        });

        this.canvas.addEventListener('keyup', e => {
            this.wirepadContext.updateKeyState({
                alt: e.altKey,
                meta: e.metaKey,
                ctrl: e.ctrlKey,
                shift: e.shiftKey
            });
        });

    }

    on(eventName:string, handler:(ev:WirePadEvent)=>void){
        this.eventTarget.addEventListener(eventName, handler);
        return this;
    }

}