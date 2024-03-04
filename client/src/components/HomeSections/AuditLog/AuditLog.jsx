import React, {useState, useEffect} from "react";
import FileManagerFacade from "../../../helpers/FileManagerFacade";
import AuditLogHeader from './AuditLogHeader';

const AuditLog = ({logs, fileManagerFacadeInstance}) => {
    const [userNamesTo, setUserNamesTo] = useState({});
    const [userNamesFrom, setUserNamesFrom] = useState({});
    const [fileNames, setFileNames] = useState({});

    useEffect(() => {
        const fetchUserNames = async () => {
            const namesTo = {};
            const namesFrom = {};
            const files = {};
            for (const log of logs) {
                try {
                    const nameResultTo = await fileManagerFacadeInstance.getUserUserName(log.userAccount);
                    const nameResultFrom = await fileManagerFacadeInstance.getUserUserName(log.executer);
                    const fileResult = await fileManagerFacadeInstance.getFileByIpfsCID(log.fileIpfsCid);
                    if (nameResultTo.success && nameResultFrom.success && fileResult.success) {
                        namesTo[log.userAccount] = nameResultTo.resultString;
                        namesFrom[log.executer] = nameResultFrom.resultString;
                        files[log.fileIpfsCid] = fileResult.file.fileName;
                    } else {
                        console.log("Something went wrong while trying to get the user's username or the files' name.");
                    }
                } catch (error) {
                    console.error("Error fetching user name:", error);
                }
            }
            setUserNamesTo(namesTo);
            setUserNamesFrom(namesFrom);
            setFileNames(files);
        };

        fetchUserNames();
    }, [logs, fileManagerFacadeInstance]);

    return (
        <>
            <h1 className='auditlog-header'>Audit Log</h1>
            <div className="content-home-wrapper"> 
                <div className="uploaded-files-container"> 
                    <AuditLogHeader/>
                    {logs.slice().reverse().map((log, index) => (
                        <div key={index} className="log-entry">
                            <div className="log-column content-padding">
                                {log.action === 'share' || log.action === 'update permissions' ? (
                                    <span>{userNamesFrom[log.executer]} -&gt; {userNamesTo[log.userAccount]}</span>
                                ) : (
                                    <span>{userNamesTo[log.userAccount]}</span>
                                )}
                            </div>
                            <div className="log-column content-padding">
                                <span>{fileNames[log.fileIpfsCid]}</span>
                            </div>
                            <div className="log-column content-padding">
                                <span>{log.action}</span>
                            </div>
                            <div className="log-column content-padding">
                                <span>{log.permissions}</span>
                            </div>
                            <div className="log-column content-padding">
                                <span>{FileManagerFacade.formatTimestamp(log.timestamp)}</span>
                            </div>
                        </div>
                    ))}
                </div>   
                <div className="background"></div>
            </div>
        </>
    );
}

export default AuditLog;