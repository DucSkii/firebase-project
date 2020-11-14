import React, { useState, useEffect } from 'react'
import './App.css';
import { auth, db, storage } from './firebase'
import firebase from 'firebase'
import MultiImageInput from 'react-multiple-image-input';

const App = () => {

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailLogin, setEmailLogin] = useState('')
  const [passwordLogin, setPasswordLogin] = useState('')
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState({})
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser)
      } else {
        setUser(null)
      }
    })

    return () => {
      unsubscribe()
    }

  }, [user, username])

  useEffect(() => {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => (
        {
          id: doc.id,
          post: doc.data(),
        })

      ))
    })
  }, [])
  // set firebase storage rules (write if true)

  const login = (event) => {
    event.preventDefault()
    auth.signInWithEmailAndPassword(emailLogin, passwordLogin)
      .catch(error => error.message)
  }

  const signUp = (event) => {
    event.preventDefault()
    auth.createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username
        })
      })
      .catch(error => alert(error.message))
  }

  const handleUpload = () => {
    if (caption === '') {
      return alert('Please enter a caption')
    } else {
      if (mapImages.length === 1) {
        const uploadTask = storage.ref(`images/${mapImages[0]}`).put(image)

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            )
            setProgress(progress)
          },
          (error) => {
            console.log(error)
          },
          () => {
            storage
              .ref('images')
              .child(mapImages[0])
              .getDownloadURL()
              .then(url => {
                db.collection("posts").add({
                  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                  caption: caption,
                  image: url,
                  username: user.displayName,
                  uid: user.uid
                })
                setProgress(0)
                setCaption('')
                setImage({})
              })
          },
        )
      }

    }
  }

  const mapImages = Object.keys(image).map(key => {
    return image[key]
  })

  const renderPage = () => {
    if (user) {
      return (
        <div>
          <h2>Username: {user.displayName}</h2>
          <button onClick={() => auth.signOut()}>logout</button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {posts.map(({ id, post }) => {
              return (
                <div key={id} style={{ border: '1px solid black', width: '400px' }}>
                  <h4>{post.username}</h4>
                  <p>{post.caption}</p>
                  <img src={post.image} alt='' style={{ width: '100%' }} />
                </div>
              )
            })}
          </div>
          <div>
            <input type='text' placeholder='enter caption...' onChange={(e) => setCaption(e.target.value)} value={caption} />
            <MultiImageInput
              images={image}
              setImages={setImage}
              allowCrop={false}
              cropConfig={{ minWidth: 'none' }}
            />
            <button onClick={handleUpload}>upload</button>
            <progress value={progress} max='100' />
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <form onSubmit={signUp}>
            <input type='text' required placeholder='username' onChange={(e) => setUsername(e.target.value)} value={username} />
            <input type='email' required placeholder='email' onChange={(e) => setEmail(e.target.value)} value={email} />
            <input type='password' required placeholder='password' onChange={(e) => setPassword(e.target.value)} value={password} />
            <button type='submit'>signup</button>
          </form>
          <form onSubmit={login}>
            <input type='email' required placeholder='email' onChange={(e) => setEmailLogin(e.target.value)} value={emailLogin} />
            <input type='password' required placeholder='password' onChange={(e) => setPasswordLogin(e.target.value)} value={passwordLogin} />
            <button type='submit'>login</button>
          </form>
        </div>
      )
    }
  }

  return (
    <div className="App">
      <h1>FireBase</h1>
      {renderPage()}
    </div >
  )
}

export default App;
