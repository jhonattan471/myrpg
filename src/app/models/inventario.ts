import { BehaviorSubject } from "rxjs";

let inventarioCounter = 0;

export class Inventario {
    slots = new BehaviorSubject<(Item | null)[]>([]);
    id = ""

    constructor(qtdSlots = 20) {
        this.slots.next(Array(qtdSlots).fill(null));
        this.id = `inv-${inventarioCounter++}`;
    }

    adicionarItem(item: { icon: string }): boolean {
        const index = this.slots.value.findIndex(slot => slot === null);
        if (index !== -1) {
            this.slots.value[index] = item;
            return true;
        }
        return false;
    }
}

export class Item {
    icon
}