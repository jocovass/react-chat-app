import React, {useState, useEffect} from 'react'
import {useErrorHandler} from 'react-error-boundary'
import 'milligram';
import { subscribe, addMessage } from './fb';

const whatchPositionOptions = {enableHighAccuracy: false, timeout: 50000,
    maximumAge: 0};
function Chat() {
    const coords = useGeolocation(whatchPositionOptions);
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useLocalStorageState('chat-username');

    useEffect(() => {
        if (!coords) return;
        const unsubscribe = subscribe(coords, (newState) => setMessages(newState));
        return unsubscribe;
    }, [coords])


    const handleSubmit = (e) => {
        e.preventDefault();
        const input = e.target.elements.message;
        if (!username || !input.value) return;
        addMessage(coords, {
            author: username,
            text: input.value
        });
        input.value = '';
    }

    return (
    <div>
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input type="text" placeholder="Enter your username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <label htmlFor="message">Message</label>
            <input type="text" placeholder="Start typing..." id="message" />
            <input className="button-primary" type="submit" value="Send" />
        </form>
        <pre>
            <code>
            {coords ? JSON.stringify(coords, null, 2) : 'NO LOCATION DATA'}
            </code>
        </pre>
        <div id="box" style={{border: '2px solid #d1d1d1', borderRadius: '5px', height: '220px', overflowY: 'scroll'}}>
            {messages.length ? (
            messages.map(message => {
                return (
                <div key={message.id} style={{backgroundColor: message.author === username ? '#9b4dca' : '#efefef', color: message.author === username ? '#fff' : '#606c76', width: '400px', margin: '5px', padding: '5px 10px', borderRadius: '10px'}}>
                    <span style={{
                    fontSize: '1.6rem',
                    fontWeight: 'bold',
                    }}>{message.author}:</span> <span style={{fontSize: '1.2rem'}}>{message.text}</span>
                </div>
                )
            })
            ) : <p>Messages...</p>}
        </div>
    </div>
  );
}

export default Chat

function useLocalStorageState(key, initialState = '', {serialize = JSON.stringify, deserialize = JSON.parse} = {}) {
    const [state, setState] = useState(() => {
        let localStorage = window.localStorage.getItem(key);
        if(localStorage) {
            try {
                return deserialize(localStorage)
            } catch(error) {
                console.log(error);
            }
        }
        return localStorage || initialState
    });

    useEffect(() => {
        window.localStorage.setItem(key, serialize(state));
    }, [state, key, serialize])

    return [state, setState]
}

function useGeolocation(options) {
    const [state, setState] = useState(null)
    // if there is an error we throw it and let the ErrorBoundary to handle it
    const handleError = useErrorHandler()

    useEffect(() => {
       window.navigator.geolocation.getCurrentPosition(
            (position) => {
                const {latitude, longitude} = position.coords;
                setState({latitude, longitude})
            },
            handleError,
            options)
    }, [handleError, options])

    return state;
}