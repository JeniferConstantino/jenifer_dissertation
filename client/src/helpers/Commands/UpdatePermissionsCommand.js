import Command from "./Command";

class UpdatePermissionsCommand extends Command {
    constructor(fileManager, selectedFile, permissions, accountUserToShareFileWith){
        super();
        this.fileManager = fileManager;
        this.selectedFile = selectedFile;
        this.permissions = permissions;
        this.accountUserToShareFileWith = accountUserToShareFileWith;
    }

    arraysHaveSameContent(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        // Sort the arrays to ensure elements are in the same order
        arr1.sort();
        arr2.sort();
        // Check if each element in arr1 exists in arr2
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        // If all elements match, return true
        return true;
    }

    async execute(){
        try {
            // Gets only the selected permissions
            const permissionsArray = Object.entries(this.permissions).filter(([key, value]) => value===true).map(([key, value]) => key);
            
            // If the user is already associated with the file
            const userIsAssociatedWithFile = await this.fileManager.verifyUserAssociatedWithFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID);
            if (!userIsAssociatedWithFile) {
                console.log("It was called 'UpdatePermissionsCommand' but the user: ", this.accountUserToShareFileWith, " is not associated with the file: ", this.selectedFile.fileName);
                return;
            }
    
            await this.fileManager.updateUserFilePermissions(this.accountUserToShareFileWith, this.selectedFile.ipfsCID, permissionsArray);
            // Verifies if the updateUserFilPermissions was successfull
            var result = await this.fileManager.getPermissionsOverFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID);    
            if (!this.arraysHaveSameContent(result.resultStrings, permissionsArray)) {
                console.log("Something went wrong while trying to associate the user with the file.");
                return;
            } else {
                console.log("File Shared."); 
            }          
            console.log("Permissions updated.");
        } catch (error) {
            console.log("ERROR: ", error);
        }
    }
    
}
export default UpdatePermissionsCommand;
