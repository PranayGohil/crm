
import React from 'react'
import { useNavigate } from 'react-router-dom'

const CreateMemberHeader = ({ onSave }) => {
  const navigate = useNavigate()
  return (
    <section className="page3-main1">
    <div className="member-profile-edit">
      <div className="pro-edit-vec">
        <img src="/SVG/vec-mem-pro.svg" alt="vec"  onClick={() => navigate(-1)} style={{cursor:"pointer"}}/>
        <span>Create Employee Profile</span>
      </div>
    </div>
  </section>
  )
}

export default CreateMemberHeader

