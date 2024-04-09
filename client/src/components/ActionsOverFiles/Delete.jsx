import { useEffect } from 'react';
import PropTypes from 'prop-types';

const Delete = ({show, fileManagerFacadeInstance, handleFileDeleted, selectedFile, uploadedActiveFiles}) => {
    
    // Delets the selected file
    useEffect(() => {
        const handleDeleteFile = async () => {
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

Delete.propTypes = {
    show: PropTypes.bool.isRequired,
    fileManagerFacadeInstance: PropTypes.object.isRequired,
    handleFileDeleted: PropTypes.func.isRequired,
    selectedFile: PropTypes.object,
    uploadedActiveFiles: PropTypes.array.isRequired
};

export default Delete;