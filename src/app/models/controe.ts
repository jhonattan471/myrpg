import { Objeto } from "./objeto";

export class Controle {
    keys = {}
    constructor(public objeto: Objeto) {
        document.addEventListener('keydown', (event) => this.keys[event.key] = true);
        document.addEventListener('keyup', (event) => this.keys[event.key] = false);
    }
}