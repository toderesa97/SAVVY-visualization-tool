class UndoManager {

    constructor() {
        this.stack_of_operations = [];
        this.index = -1;
    }

    reset() {
        this.stack_of_operations = [];
        this.index = -1;
    }

    add(operation) {
        if (this.index === -1) {
            this.stack_of_operations.push(operation);
        } else {
            if (operation.operation !== this.stack_of_operations[this.index].undo_f) {
                this.stack_of_operations.push(operation);
            } else {
                return;
            }
        }
        console.log("STACK => ", this.stack_of_operations);
        this.index++;
    }

    undo() {
        if (this.index === -1 || this.stack_of_operations.length === 0) {
            return;
        }
        console.log("INDEX=>", this.index, this.stack_of_operations);
        let func = this.stack_of_operations[this.index].undo_f;
        let params = this.stack_of_operations[this.index].params_undo;

        func.apply(this, params);
        this.stack_of_operations.splice(this.index, 1);
        this.index--;

    }

    redo() {
        if (this.index === this.stack_of_operations.length || this.stack_of_operations.length === 0) {
            return;
        }
        this.stack_of_operations[this.index++]();
    }



}