import { useEffect } from 'react';

const Delete = ({show, fileManagerFacadeInstance, handleFileDeleted, selectedFile, uploadedActiveFiles}) => {
    
    // Delets the selected file
    useEffect(() => {
        const handleDeleteFile = async (e) => {
            if (show) {
                console.log('Deleting file ...');
                try {
                    await fileManagerFacadeInstance.deleteFile(selectedFile, handleFileDeleted, uploadedActiveFiles);
                } catch (error) {
                    console.error('Error downloading file:', error);
                } 
            }
        }

        handleDeleteFile();
    }, [fileManagerFacadeInstance, handleFileDeleted, selectedFile, show, uploadedActiveFiles]);

    return null;
}

export default Delete;