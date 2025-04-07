export class Inventario {
    slots: ({ icon: string } | null)[] = [];

    constructor(public maxSlots: number = 20) {
        this.slots = Array(this.maxSlots).fill(null);
    }

    adicionarItem(item: { icon: string }): boolean {
        const index = this.slots.findIndex(slot => slot === null);
        if (index !== -1) {
            this.slots[index] = item;
            return true;
        }
        return false;
    }

    moverItem(origem: number, destino: number) {
        const temp = this.slots[destino];
        this.slots[destino] = this.slots[origem];
        this.slots[origem] = temp;
    }
}