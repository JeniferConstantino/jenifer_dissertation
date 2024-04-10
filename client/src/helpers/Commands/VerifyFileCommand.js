import Command from "./Command.js";

// Concrete command for uploading a file
class VerifyFileCommand extends Command {

    constructor(fileAsBuffer, generateHash256, verifyValidFile, recordFileVerification, selectedUserAccount) {
        super();
        this.fileAsBuffer = fileAsBuffer;
        this.generateHash256 = generateHash256;
        this.verifyValidFile = verifyValidFile;
        this.recordFileVerification = recordFileVerification;
        this.selectedUserAccount = selectedUserAccount;
    }

    async execute(){
        // Generates the hash of the file to verify
        const fileHash = await this.generateHash256(this.fileAsBuffer);

        // Sees if the user has any file, in the active state (independently of the version) with the same hash
        const validFile = await this.verifyValidFile(this.selectedUserAccount, fileHash);

        if (validFile) {
            // Records the file verification
            await this.recordFileVerification(this.selectedUserAccount, fileHash);
            return true;
        } 
        return false;
    }
}

export default VerifyFileCommand;