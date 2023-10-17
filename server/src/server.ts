import { initializeDependencias } from "./dependencias";



//const appServer = new AppServer(appRouter);


//appServer.startServer().then((res)=> console.log('succes', res)).catch((err)=>console.log('error', err))


export const app =  initializeDependencias()

/*
class Singleton {
  private static instance: Singleton | null = null;
  private data: string;

  private constructor(data: string) {
    this.data = data;
  }

  public static getInstance(data: string): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton(data);
    }
    return Singleton.instance;
    //throw new Error ('instance exists')}
  }

  public getData(): string {
    return this.data;
  }
}

const singleton1 = Singleton.getInstance("ala ma kota");
console.log(singleton1.getData()); // Outputs: This is the singleton instance.

async function f1(param: string) {
  if (param === "a") {
    return Promise.resolve("resolved f1");
  }
  return Promise.reject("uniqueError");
}

function compensate(param: string): Promise<string> {
  if (param == "ok") {
    return Promise.resolve("ok");
  }
  console.log("log");
  return Promise.reject("notOK");
}

async function f2() {
  return f1("a")
    .then(() => "ala ma kota")

    .catch((err) => {
      return (
        compensate("ok")
          .then((err) => Promise.reject(err))
          //.catch((err) => Promise.reject(err))

          .catch(() => {
            if (err === "uniqueError") {
              console.log("if in unique");
              const res = provideMongoError(err);
              return Promise.reject(`resss ${res}`);
            }

            return Promise.reject(err);
          })
      );

      //.then(()=>Promise.reject(err)).catch(()=>Promise.reject(err))
    });
  //.catch((err)=> {compensate("notOK")})
}

f2()
  .then((res) => console.log(res))
  .catch((r) => console.log(r));

function provideMongoError(err: string) {
  console.log("provider");
  return `uniqueError`;
}

function prom() {
  return Promise.reject("a");
}

function ret(): Promise<string> {
  return prom()
    .then((res) => Promise.resolve(res))
    .catch((res) => {
      const a = "dupa";
      return Promise.reject(`ddddddd ${res}`);
    });
}

ret()
  .then((res) => console.log("resolved", res))
  .catch((res) => console.log("rejected", res));
*/
