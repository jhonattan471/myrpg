export class NotPossibleError extends Error {
    constructor() {
        super("Movimento não permitido: posição já ocupada");
        this.name = "NotPossibleError";
    }
}