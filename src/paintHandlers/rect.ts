import { PaintHandler, PaintHandlerTools } from "../paintHandler"
import { ElementType } from "../wirepadContext"

export class RectPaintHandler extends PaintHandler{

    onPaint(tools:PaintHandlerTools){
        let {element, paintContext, handled} = tools;

        if (handled || element.type !== ElementType.RECT) return false;


        paintContext.fillStyle = element.pref?.backgroundColor?.toString() ?? "dimgray";

        if (element.pref?.borderRadius){
            // rounded rect

            let radius = Number(element.pref.borderRadius);

            paintContext.beginPath();
            paintContext.moveTo(element.location.x, element.location.y + radius);

            paintContext.quadraticCurveTo(
                element.location.x,
                element.location.y,
                element.location.x + radius, 
                element.location.y
            );
            paintContext.lineTo(element.location.x + element.size.w - radius, element.location.y); // top line

            paintContext.quadraticCurveTo(
                element.location.x + element.size.w,
                element.location.y,
                element.location.x + element.size.w, 
                element.location.y + radius
            );
            paintContext.lineTo(element.location.x + element.size.w, element.location.y + element.size.h - radius); // right line

            paintContext.quadraticCurveTo(
                element.location.x + element.size.w,
                element.location.y + element.size.h,
                element.location.x + element.size.w - radius,
                element.location.y + element.size.h
            );
            paintContext.lineTo(element.location.x + radius, element.location.y + element.size.h);

            paintContext.quadraticCurveTo(
                element.location.x,
                element.location.y + element.size.h,
                element.location.x, 
                element.location.y + element.size.h - radius
            );
            paintContext.lineTo(element.location.x, element.location.y + radius);
        
            paintContext.closePath();

            paintContext.fill();
        }
        else{
            // non rounded rect

            paintContext.fillRect(
                element.location.x,
                element.location.y,
                element.size.w,
                element.size.h
            );
        }
    }

}