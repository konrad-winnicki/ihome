import Router from "koa-router"
import Koa from 'koa'


export class AppRouter extends Router{
    private _router:Router
    constructor(){
        super()
        this._router = new Router
    }

    public getRoute(path:string, controler:(ctx: Koa.Context)=>void){
        this.router.get(path, controler)
    }
    public postRoute(path:string, controler:(ctx: Koa.Context)=>void){
        this.router.post(path, controler)
    }

    get router(){
        return this._router
    }

}