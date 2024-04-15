import Command from "./Command.js";

class DeleteFileCommand extends Command {
    constructor(selectedFile, handleFileDeleted, uploadedFiles, deactivateFile){
        super();
        this.selectedFile = selectedFile;
        this.uploadedFiles = uploadedFiles;
        this.handleFileDeleted = handleFileDeleted;
        this.deactivateFile = deactivateFile;
    }

    async execute(){
        try {
            // Calls the method to deactivate the file
            await this.deactivateFile(this.selectedFile.ipfsCID);    
            console.log("Files deleted.");

            // Remove the selectedFile from the uploadedFiles array
            this.uploadedFiles = this.uploadedFiles.filter(file => file.ipfsCID !== this.selectedFile.ipfsCID);

            // Call handleFileDeleted with the updated uploadedFiles array
            this.handleFileDeleted(this.uploadedFiles);
        } catch (error) {
            console.error("Error while trying to delete the file: ", error);
        }
    }
}

export default DeleteFileCommand;
