import { Objeto } from "./objeto";

export class Posicao {

    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
        public objetos: Objeto[] = []
    ) {

    }
}