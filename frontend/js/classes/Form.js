export default class Form {
    #form = undefined;

    constructor(form) {
        this.#setForm = form;
    }

    /*  */

    /**
     * @returns {HTMLFormElement}
     */
    get getForm() {
        return (this.#form);
    }

    /**
     * @param {HTMLFormElement} form
    */
    set #setForm(form) {
        this.#form = form;
    }

    /*  */

    resetInputs() {
        this.getForm.reset();
    }
}