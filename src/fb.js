import * as firebase from 'firebase/app'
import 'firebase/database'

const config = {
    apikey: process.env.REACT_APP_API_KEY,
    databaseURL: process.env.REACT_APP_DATABASE,
    projectId: process.env.REACT_APP_PROJECT_ID
}

firebase.initializeApp(config)
const db = firebase.database();

function subscribe(coords, callback) {
    const chatId = generateId(coords);
    db.ref(`messages/${chatId}`)
            .on('value', (snapshot) => {
                const values = snapshot.val();
                if (!values) return
                callback(Object.entries(values).map(([key, value]) => ({id: key, ...value})));
            })

    return () => db.ref(`messages/${chatId}`).off();
}

function addMessage(coords, message) {
    const chatId = generateId(coords);
    db.ref(`messages/${chatId}`).push({
        date: Date.now(),
        ...message,
    })
}

function generateId({latitude, longitude}) {
    return `${(latitude * 10).toFixed()}_${(longitude * 10).toFixed()}`;
}

export {subscribe, addMessage}