defineCustomElement(
  "tail-dropzone",
  class Dropzone extends HTMLElement {
    files = [];
    isOver = false;

    connectedCallback() {
      this.addEventListener("dragover", this.onDragOver);
      this.addEventListener("dragleave", this.onDragLeave);
      this.addEventListener("drop", this.onDrop);
      this.addEventListener("click", this.onClick);
    }
    /**
     * @param {MouseEvent} e
     */
    onClick = (e) => {
      const selectedFile = e.composedPath().find((element) => !!element?.getAttribute("data-selected-file"));
      if (selectedFile) {
        const index = Array.from(selectedFile.parentNode.childNodes()).indexOf(selectedFile);
        console.log(index);
        // remove selectedFile
      }
    };

    /**
     * @param {DragEvent} e
     */
    onDragOver = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const length = e.dataTransfer.files.length;

      let isOkToDrop = true;
      for (const file of e.dataTransfer.files) {
        // prevent unwanted file type if necessary
        // prevent unwanted file size if necessary
        //  if(file.type !== ""){
        //    isOkToDrop = false
        //  }
        //  if(file.size >= 1000 * 10 ) {
        //    isOkToDrop = false
        //  }
        if (length + this.files.length > this.limit || !isOkToDrop) {
          return this.preventDropping();
        }
        this.acceptDrop();
      }
    };

    /**
     * @param {DragEvent} e
     */
    onDragLeave = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.setAttribute("data-accepted", "false");
      this.setAttribute("data-prevented", "false");
    };

    /**
     * @param {DragEvent} e
     */
    onDrop = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    acceptDrop = () => {
      this.setAttribute("data-accepted", "true");
    };
    preventDropping = () => {
      this.setAttribute("data-prevented", "true");
    };
    setFilesNames = (files) => {
      for (const file of files) {
        const name = `${file.name}`;
      }
    };
  }
);
