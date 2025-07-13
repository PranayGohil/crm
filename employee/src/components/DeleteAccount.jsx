import React from 'react';

const DeleteAccount = () => {
    return (
        <section className="delete-account mg-delete-acc">
            <div className="delete-account-inner">
                <span>Delete Account</span>
            </div>
            <div className="warning-msg">
                <div className="warning-img">
                    <img src="/SVG/warning-vec.svg" alt="warning-img" />
                </div>
                <div className="warning-txt">
                    <p>Warning: This action cannot be undone</p>
                    <span>
                        Deleting this team member account will permanently remove all their data, access
                        rights, and history from the system. This action is irreversible.
                    </span>
                </div>
            </div>
            <div className="delete-Account-btn">
                <a href="#">Delete Account</a>
            </div>
        </section>
    );
};

export default DeleteAccount;
