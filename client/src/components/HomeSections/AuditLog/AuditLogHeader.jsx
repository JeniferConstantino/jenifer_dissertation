import React from "react";
import { FcExternal, FcClock, FcReadingEbook, FcDocument} from 'react-icons/fc';

const AuditLog = () => {
    return (
        <>
            <div className="log-entry header">
                <div className="log-column">
                    <FcReadingEbook size={20} />
                    <span>User(s)</span>
                </div>
                <div className="log-column">
                    <FcDocument />
                    <span>File Name</span>
                </div>
                <div className="log-column">
                    <FcExternal size={20} />
                    <span>Action</span>
                </div>
                <div className="log-column">
                    <FcExternal size={20} />
                    <span>Permissions</span>
                </div>
                <div className="log-column">
                    <FcClock size={20} />
                    <span>Date</span>
                </div>
            </div>
        </>
    );
}

export default AuditLog;