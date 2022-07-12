import React, { useState, useEffect, useRef } from "react";
import "./app.css";
import Message from "./Message/Message";
import {
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { app } from "./firebase";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";


const auth = getAuth(app);
const db = getFirestore(app);

// for login
const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

const logoutHandler = () => signOut(auth);

function App() {
  const [user, setUser] = useState(false);
  // for taking input from input message
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const divForScroll = useRef(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setMessage("");
      await addDoc(collection(db, "Messages"), {
        text: message,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp()
      });

      divForScroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      await (error);
    }
  }

  useEffect(() => {
    const q = query(collection(db, "Messages"), orderBy("createdAt", "asc"));

    const unsubscribe = onAuthStateChanged(auth, (data) => {
      console.log(data)
      setUser(data)
    });

    const unsubscribeForMessage = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((item) => {
          const id = item.id;
          return { id, ...item.data() };
        })
      );
    });

    return () => {
      unsubscribe();
      unsubscribeForMessage();
    }
  }, [])

  return (
    <div className="chat-app-wrapper">
      {
        user ? (
          <div className="chat-wrapper-inside">
            <div className="logout-wrapper">
              <button onClick={() => { logoutHandler() }} className="logout">
                Logout
              </button>
            </div>
            <div className="message-panel">
              {
                messages.map((item) => (
                  <Message
                    key={item.id}
                    text={item.text}
                    uri={item.uri}
                    user={item.uid === user.uid ? "me" : "other"}
                  />
                ))
              }
            </div>
            <div ref={divForScroll}></div>
            <div className="content-wrapper" >

              <form onSubmit={submitHandler} className="form">
                <div className="form-wrapper">
                  <div className="input-wrapper">
                    <input
                      placeholder="enter a message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <div className="logout-wrapper">
                    <button type="submit" colorScheme={"purple"} className="logout">send</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) :
          <div className="logout-wrapper login-wrapper">
            <button onClick={loginHandler}  className="logout">Sign in with google</button>
          </div>
      }
    </div>
  );
}

export default App;


