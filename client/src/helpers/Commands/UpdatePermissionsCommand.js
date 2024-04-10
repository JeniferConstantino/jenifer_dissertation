import Command from "./Command.js";

class UpdatePermissionsCommand extends Command {
    constructor(selectedFile, permissions, accountUserToShareFileWith, verifyUserAssociatedWithFile, updateUserFilePermissions, getPermissionsOverFile, removeUserFileAssociation){
        super();
        this.selectedFile = selectedFile;
        this.permissions = permissions;
        this.accountUserToShareFileWith = accountUserToShareFileWith;
        this.verifyUserAssociatedWithFile = verifyUserAssociatedWithFile;
        this.updateUserFilePermissions = updateUserFilePermissions;
        this.getPermissionsOverFile = getPermissionsOverFile;
        this.removeUserFileAssociation = removeUserFileAssociation;
    }

    arraysHaveSameContent(arr1, arr2) {
        const copyArr1 = arr1.slice();
        const copyArr2 = arr2.slice();

        // Sort the arrays to ensure elements are in the same order
        copyArr1.sort();
        copyArr2.sort();
        // Check if each element in arr1 exists in arr2
        for (let i = 0; i < copyArr1.length; i++) {
            // eslint-disable-next-line security/detect-object-injection
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
            // eslint-disable-next-line security/detect-object-injection
            const permissionsArray = Object.keys(this.permissions).filter(key => this.permissions[key]);
            
            // If the user is already associated with the file
            const userIsAssociatedWithFile = await this.verifyUserAssociatedWithFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID);
            if (!userIsAssociatedWithFile) {
                console.log("It was called 'UpdatePermissionsCommand' but the is not associated with the selected file.");
                return;
            }
    
            if (permissionsArray.length !== 0) {
                // update users' permissions
                await this.updateUserFilePermissions(this.accountUserToShareFileWith, this.selectedFile.ipfsCID, permissionsArray);
                
                // Verifies if the updateUserFilPermissions was successfull
                var result = await this.getPermissionsOverFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID);    
                if (!this.arraysHaveSameContent(result.resultStrings, permissionsArray)) {
                    console.log("Something went wrong while trying to associate the user with the file.");
                    return;
                } else {
                    console.log("File Shared."); 
                }     
            } else {
                // remove the relationship between the user and the file (inlcuding all the files past editions)
                await this.removeUserFileAssociation(this.accountUserToShareFileWith, this.selectedFile.ipfsCID);

                // Verifies if the relationship was well removed
                var userAssociatedFile = await this.verifyUserAssociatedWithFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID);
                if (userAssociatedFile) {
                    console.log("Something went wrong while trying to remove the relationship between the user and the file.");
                } else {
                    console.log("Relationship removed"); 
                }
            }
        } catch (error) {
            // eslint-disable-next-line security-node/detect-crlf
            console.log("ERROR: ", error);
        }
    }
    
}
export default UpdatePermissionsCommand;
