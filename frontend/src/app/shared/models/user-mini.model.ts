import { environment } from "../../../environments/environment";

export class UserMini {
  common: string[] = [];

  constructor(public id:string, public username: string, private _imagePath: string) {}

  get imagePath(){
    return environment.backend_endpoint + "/" + this._imagePath
}

set imagePath(imagePath:string){
    this._imagePath = imagePath
}
}
