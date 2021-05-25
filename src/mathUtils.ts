
export type Point = {
    x: number;
    y: number;
};

export type Size = {
    w: number;
    h: number;
}

export type Rect = Point & Size;

export type HandlePoints = {
    top?: Point,
    right?: Point,
    bottom?: Point,
    left?: Point,
    topLeft?: Point,
    topRight?: Point,
    bottomLeft?: Point,
    bottomRight?: Point,

    shape:"plus"|"cross"
}

export type Handles = HandlePoints & { size: Size }

export type ResizeHandleInfo = Handles & {
    cursor: Point,
    selectedHandleName?: keyof HandlePoints,
    isHandleActive: boolean
}

export function boundContains(point:Point, bounds:Rect){
    if (bounds.x <= point.x && bounds.x + bounds.w >= point.x){
        if (bounds.y <= point.y && bounds.y + bounds.h >= point.y){
            return true;
        }
    }
    return false;
}