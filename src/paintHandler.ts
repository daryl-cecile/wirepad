import { WirePadContext, WirePadElement } from "./wirepadContext";

export type PaintHandlerTools = {
    paintContext:CanvasRenderingContext2D;
    context:WirePadContext; 
    element:WirePadElement;
    handled:boolean;
};

export abstract class PaintHandler{

    public abstract onPaint(tools:PaintHandlerTools):boolean|void;

}