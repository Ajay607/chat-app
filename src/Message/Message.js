import React from 'react'
import "./Message.css"

const Message = ({ text, uri, user = "other" }) => {

  return (
    <div className={user === "me" ? "user-me user" : "user-other user"}>
      <div>
        {
          user === "me" && <img className='user-img' src={uri} />
        }
        <div className='text'>{text}</div>
        {
          user === "other" && <img className='user-img' src={uri} />
        }
      </div>
    </div>
  )
}

export default Message;


