import { useEffect } from 'react';

const Download = ({show, fileManagerFacadeInstance, handleDownloaded, selectedFile}) => {
    
    // Downloads the selected file
    useEffect(() => {
        const handleDownload = async (e) => {
            if (show) {
                console.log('Download file ...');
                try {
                    var blob = await fileManagerFacadeInstance.downloadFile(selectedFile);
                    
                    // Creates a downloaded link 
                    const downloadLink = document.createElement("a");
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.download = selectedFile.fileName;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);

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