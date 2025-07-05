import React from 'react';

const TaskDetailSearchBar = () => {
    // const projectData = {
    //   title: 'Subtask View',
    //   projectName: 'Main-project name'
    // };
    // TODO: Replace with API call

    return (
        <section className="sv-sec1 header">
            <div className="sv-sec1-inner">
                <div className="cd-head-menu head-menu">
                    <h1>Subtask View</h1>
                    <p>Main-project name</p>
                </div>
                <div className="cd-nav-bar nav-bar">
                    <div className="cd-nav-search nav-search">
                        <div className="cd-searchbar searchbar">
                            <div className="cd-input-type input-type">
                                <div className="cd-img-search-input img-search-input">
                                    <img src="/SVG/search-icon.svg" alt="search" />
                                </div>
                                <div className="cd-input-type-txt input-type-txt">
                                    <input
                                        type="text"
                                        placeholder="Search by name, email..."
                                        style={{ border: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TaskDetailSearchBar;
