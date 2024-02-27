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
        const copyArr1 = arr1.slice();
        const copyArr2 = arr2.slice();

        // Sort the arrays to ensure elements are in the same order
        copyArr1.sort();
        copyArr2.sort();
        // Check if each element in arr1 exists in arr2
        for (let i = 0; i < copyArr1.length; i++) {
            if (copyArr1[i] !== copyArr2[i]) {
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
