import { useEffect } from 'react';
import PropTypes from 'prop-types';

const Download = ({show, fileManagerFacadeInstance, handleDownloaded, selectedFile}) => {
    
    // Downloads the selected file
    useEffect(() => {
        const handleDownload = async () => {
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

Download.propTypes = {
    show: PropTypes.bool.isRequired,
    fileManagerFacadeInstance: PropTypes.object.isRequired,
    handleDownloaded: PropTypes.func.isRequired,
    selectedFile: PropTypes.object
};

export default Download;