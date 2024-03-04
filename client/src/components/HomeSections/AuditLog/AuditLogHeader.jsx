import React from "react";
import { FcExternal, FcClock, FcReadingEbook, FcDocument, FcKey} from 'react-icons/fc';

const AuditLog = () => {
    return (
        <>  
            <div className="log-entry header">
                <div className="log-column content-padding">
                    <span><FcReadingEbook className="icon" size={25}/><strong>User(s)</strong></span>
                </div>
                <div className="log-column content-padding">
                    <span><FcDocument className="icon" size={25}/><strong>File Name</strong></span>
                </div>
                <div className="log-column content-padding">
                    <span><FcExternal className="icon" size={25}/><strong>Action</strong></span>
                </div>
                <div className="log-column content-padding">
                    <span><FcKey className="icon" size={25}/><strong>Permissions</strong></span>
                </div>
                <div className="log-column content-padding">
                    <span><FcClock className="icon" size={23}/><strong>Date</strong></span>
                </div>
            </div>
        </>
    );
}

export default AuditLog;