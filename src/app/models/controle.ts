import { Objeto } from "./objeto";

export class Controle {
    keys = {
        w: false
    }
    speed = 1
    objetoSelecionado?: Objeto

    constructor(public self = this) {

    }

    selecionarObjeto(objeto: Objeto) {
        this.objetoSelecionado = objeto
    }
}

export class ControleIA extends Controle {

}

export class ControlePlayer extends Controle {
    constructor() {
        super();
        document.addEventListener('keydown', (event) => {
            this.keys[event.key] = true
        })
        document.addEventListener('keyup', (event) => {
            this.keys[event.key] = false
        });
    }
}   