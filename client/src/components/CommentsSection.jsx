import React from "react";

const comments = [
  {
    id: 1,
    name: "Emma Davis",
    role: "Project Manager",
    timeAgo: "2 days ago",
    text: "Please make sure to include the smaller diamond details as specified in the client brief. They want exactly 16 stones in the halo setting.",
    avatar: "/Image/prn1.png",
  },
  {
    id: 2,
    name: "Emma Davis",
    role: "Project Manager",
    timeAgo: "2 days ago",
    text: "Please make sure to include the smaller diamond details as specified in the client brief. They want exactly 16 stones in the halo setting.",
    avatar: "/Image/prn1.png",
  },
  {
    id: 3,
    name: "Emma Davis",
    role: "Project Manager",
    timeAgo: "2 days ago",
    text: "Please make sure to include the smaller diamond details as specified in the client brief. They want exactly 16 stones in the halo setting.",
    avatar: "/Image/prn1.png",
  },
];

const CommentsSection = () => {
  return (
    <section className="pb-sec-7 pb-sec2">
      <div className="pb-sec7-inner pb-sec3-inner">
        <div className="pb-sec7-heading">
          <h1>Comments</h1>
          <p><span style={{ paddingRight: "4px" }}>{comments.length}</span>comments</p>
        </div>

        <div className="pb-comment-sec">
          {comments.map((comment) => (
            <div className="pb-client-comment" key={comment.id}>
              <img src={comment.avatar} alt={comment.name} />
              <div className="pb-comment-description">
                <div className="pb-comment-cilent-name">
                  <div className="pb-name-time">
                    <div className="pb-cilent-name">
                      <h4>{comment.name}</h4>
                      <span>{comment.role}</span>
                    </div>
                    <p><span style={{ paddingRight: "6px" }}>{comment.timeAgo}</span></p>
                  </div>
                  <p>{comment.text}</p>
                </div>
                <div className="pb-comments-btns">
                  <a href="#">Reply</a>
                  <a href="#">Like</a>
                </div>
              </div>
            </div>
          ))}

          <div className="pb-add-post-comment">
            <div className="pb-add-comment">
              <img src="/Image/Riya Sharma.png" alt="Riya Sharma" />
              <div className="pb-type-comment">
                <input type="text" placeholder="Write a comment..." />
              </div>
            </div>
            <div className="pb-add-components">
              <div className="pb-add-imgs">
                <a href="#"><img src="/SVG/add-photo.svg" alt="Add Photo" /></a>
                <a href="#"><img src="/SVG/add-emoji.svg" alt="Add Emoji" /></a>
                <a href="#"><img src="/SVG/mention.svg" alt="Mention" /></a>
              </div>
              <div className="add-mbr">
                <div className="plus-icon">
                  <a href="#"><span>Post Comment</span></a>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default CommentsSection;
