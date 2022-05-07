import styles from "./modalMenus.module.css";



class modalMenu {
    modal: HTMLDialogElement;
    closeButton: HTMLButtonElement;
    inner: HTMLElement;

    constructor() {
        this.modal = document.createElement("dialog");
        document.body.append(this.modal);
        this.modal.className = styles.menu;

        this.closeButton = document.createElement("button");
        this.closeButton.className = styles.closeButton;
        this.closeButton.onclick = () => this.close();
        this.modal.append(this.closeButton);

        this.inner = document.createElement("div");
        this.inner.className = styles.inner;
        this.modal.append(this.inner);
    }

    open() {
        this.modal.showModal();
    }
    close() {
        this.modal.close();
    }
}



export default modalMenu;