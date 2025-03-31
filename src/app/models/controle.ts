import { Objeto } from "./objeto";

export class Controle {
    keys = {
        w: false
    }
    speed = 1

    constructor(public self = this) {

    }
}

export class ControleIA extends Controle {

}

export class ControlePlayer extends Controle {
    constructor() {
        super();
        document.addEventListener('keydown', (event) => {
            // console.log("keydown", event)
            this.keys[event.key] = true
        })
        document.addEventListener('keyup', (event) => {
            // console.log("keyup ", event)
            this.keys[event.key] = false
        });
    }
}   