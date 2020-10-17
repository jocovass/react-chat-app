import * as firebase from 'firebase/app';
import 'firebase/database';


const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    databaseURL: process.env.REACT_APP_DATABASE,
    projectId: process.env.REACT_APP_PROJECT_ID,
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  function addMessage(coords, username, message) {
    const locationId = getLocationId(coords);
    db.ref(`messages/${locationId}/posts`).push({text: message, author: username, data: Date.now()});
  }

  function subscribe(coords, callback) {
    const locationId = getLocationId(coords);
    const ref = db.ref(`messages/${locationId}/posts`).limitToFirst(50);
    ref.on('value', (snap) => {
      const messages = snap.val();
      callback(Object.entries(messages || {}).map(([id, data]) => ({id, ...data})))
    })

    return () => ref.off("value", callback);
  }

  const getLocationId = ({latitude, longitude}) =>
  `${(latitude * 10).toFixed()}_${(longitude * 10).toFixed()}`

  export {addMessage, subscribe}