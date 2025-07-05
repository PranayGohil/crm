import React from 'react';
import TaskBoardReturn from '../components/TaskBoardReturn';
import ProjectHeader from '../components/ProjectHeader';
import TaskSubheader from '../components/TaskSubheader';
import TaskOverview from '../components/TaskOverview';
import ProjectDescription from '../components/ProjectDescription';
import AttachedMedia from '../components/AttachedMedia';
import CommentsSection from '../components/CommentsSection';
import TaskFooterActions from '../components/TaskFooterActions';

const PreviewButton = () => {
  return (
    <div className="preview-page">
      <TaskBoardReturn />
      <ProjectHeader />
      <TaskSubheader />
      <TaskOverview />
      <ProjectDescription />
      <AttachedMedia />
      <CommentsSection />
      <TaskFooterActions />
    </div>
  );
};

export default PreviewButton;
