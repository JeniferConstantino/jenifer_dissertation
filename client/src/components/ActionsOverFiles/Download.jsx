import { useEffect } from 'react';

const Download = ({show, fileManagerFacadeInstance, handleDownloaded, selectedFile}) => {
    
    // Downloads the selected file
    useEffect(() => {
        const handleDownload = async (e) => {
            if (show) {
                console.log('Download file ...');
                try {
                    await fileManagerFacadeInstance.downloadFile(selectedFile);
                    handleDownloaded();
                } catch (error) {
                    console.error('Error downloading file:', error);
                } 
            }
        }

        handleDownload();
    }, [fileManagerFacadeInstance, handleDownloaded, selectedFile, show]);

    return null;
}

export default Download;