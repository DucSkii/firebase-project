import firebase from 'firebase'

var firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyCrIWjgo-k9ez8qqywkosZzwsm7r5v7OX4",
  authDomain: "fir-project-52ac3.firebaseapp.com",
  databaseURL: "https://fir-project-52ac3.firebaseio.com",
  projectId: "fir-project-52ac3",
  storageBucket: "fir-project-52ac3.appspot.com",
  messagingSenderId: "1022090653243",
  appId: "1:1022090653243:web:35175f75f4198e53f5361e",
  measurementId: "G-Q0E5NRGQ3J"
})

const storage = firebase.storage()
const db = firebaseApp.firestore()
const auth = firebase.auth()

export { storage, db, auth }