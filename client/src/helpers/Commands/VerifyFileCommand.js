import Command from "./Command";

// Concrete command for uploading a file
class VerifyFileCommand extends Command {

    constructor(fileManager, fileAsBuffer) {
        super();
        this.fileManager = fileManager;
        this.fileAsBuffer = fileAsBuffer;
    }

    async execute(){
        // Generates the hash of the file to verify
        const fileHash = await this.fileManager.generateHash256(this.fileAsBuffer);

        // Sees if the user has any file, in the active state (independently of the version) with the same hash
        const validFile = await this.fileManager.verifyValidFile(this.fileManager.selectedUser.account, fileHash);

        if (validFile) {
            return true;
        } 
        return false;
    }
}

export default VerifyFileCommand;