
export class WirePadEvent<P=any> extends Event{

    public payload:P = null;

    static init<P=any>(eventName:string, payload?:P){
        let wpe = new WirePadEvent<P>(eventName);
        if (payload) wpe.payload = payload;
        return wpe;
    }
}