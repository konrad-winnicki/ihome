import Router from "koa-router"
import Koa from 'koa'



export class RootRegister {
    private _router: Router
    constructor (router:Router){
        this._router = router
    }

    public setRoute(method:string, path:string, controler:(ctx: Koa.Context)=>void){
        if (method === "get"){
            this._router.get(path, controler)
        }
        if (method === "post"){
            this._router.post(path, controler)
        }
    }

    get router(){
        return this._router
    }


}