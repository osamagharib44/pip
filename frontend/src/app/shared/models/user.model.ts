import { environment } from "../../../environments/environment";
import { UserMini } from "./user-mini.model";


export class User{
    friends:UserMini[] = []
    friendRequests:UserMini[] = []
    constructor(public id:string, public username:string, public email:string, private _imagePath:string){

    }

    get imagePath(){
        return environment.backend_endpoint + "/" + this._imagePath
    }

    set imagePath(imagePath:string){
        this._imagePath = imagePath
    }
}