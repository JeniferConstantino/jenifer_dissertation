import Command from "./Command";

class DeleteFileCommand extends Command {
    constructor(fileManager, selectedFile, handleFileDeleted, uploadedFiles){
        super();
        this.fileManager = fileManager;
        this.selectedFile = selectedFile;
        this.uploadedFiles = uploadedFiles;
        this.handleFileDeleted = handleFileDeleted;
    }

    async execute(){
        try {
            // Calls the method to deactivate the file
            await this.fileManager.deactivateFile(this.fileManager.selectedUser.account, this.selectedFile.ipfsCID);    
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
