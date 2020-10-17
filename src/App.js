import React, { useEffect, useState, useRef } from 'react';
import 'milligram'
import {addMessage, subscribe} from './firebase'

function App() {
  const {coords, error} = useCoords();
  const [messages, setMessages] = useState([])
  const [username, setUsername] = useLocalStorageState('', 'username');
  const [message, setMessage] = useState('');
  const boxRef= useRef();
  useStickyScrollContainer(boxRef, [messages.length]);
  const visibleNodes = useVisibilityCounter(boxRef);
  const unreadCount = messages.length - visibleNodes.length;

  useEffect(() => {
    if (!coords) return;
    const close = subscribe(coords, (messages) => setMessages(messages));

    return close;
  }, [coords])

  useEffect(() => {
    document.title = unreadCount ? `Unread: ${unreadCount}` : 'All read'
  }, [unreadCount])

  const initialDocTitle = useRef(document.title)
  useEffect(() => () => document.title = initialDocTitle, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message) return;
    addMessage(coords, username, message);
    setMessage('')
  }

  return (
    <div>
     <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username</label>
      <input type="text" placeholder="Enter your username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <label htmlFor="message">Message</label>
      <input type="text" placeholder="Start typing..." id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
      <input className="button-primary" type="submit" value="Send" />
      </form>
      <pre>
        <code>
          {coords ? JSON.stringify(coords, null, 2) : error ? error.message : 'NO LOCATION DATA'}
        </code>
      </pre>
      <div id="box" ref={boxRef} style={{border: '2px solid #d1d1d1', borderRadius: '5px', height: '220px', overflowY: 'scroll'}}>
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

function useCoords() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null)
  useEffect(() => {
    const id = window.navigator.geolocation.getCurrentPosition((res) => {
      const newPos = {latitude: res.coords.latitude, longitude: res.coords.longitude};
      setCoords(newPos)
    },
    (err) => setError(err))
    return window.navigator.geolocation.clearWatch(id);
  }, [])

  return {coords, error};
}

function useLocalStorageState(defaultVal, key, {serialize = JSON.stringify, deserialize = JSON.parse} = {}) {
  const [state, setState] = useState(() => {
    const ls = window.localStorage.getItem(key);
    if (ls) {
      try {
        return deserialize(ls)
      } catch(err) {
        window.localStorage.removeItem(key);
      }
    }

    return typeof defaultVal === 'function' ? defaultVal() : defaultVal;
  })
  const prevKeyRef = useRef(key);

  useEffect(() => {
    if (prevKeyRef.current !== key) {
      window.localStorage.removeItem(prevKeyRef.current);
    }
    prevKeyRef.current = key;

    window.localStorage.setItem(key, serialize(state))
  }, [key, state, serialize])

  return [state, setState]
}

function useStickyScrollContainer(scrollContainerRef, inputs = []) {
  const [isStuck, setStuck] = React.useState(true)
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    function handleScroll() {
      const {clientHeight, scrollTop, scrollHeight} = scrollContainer
      const partialPixelBuffer = 10
      const scrolledUp =
        clientHeight + scrollTop < scrollHeight - partialPixelBuffer
        console.log(scrolledUp)
      setStuck(!scrolledUp)
    }
    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef])

  const scrollHeight = scrollContainerRef.current
    ? scrollContainerRef.current.scrollHeight
    : 0

  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (isStuck) {
      scrollContainer.scrollTop = scrollHeight
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStuck, scrollContainerRef, scrollHeight, ...inputs])

  return isStuck
}

function useVisibilityCounter(containerRef) {
  const [seenNodes, setSeenNodes] = React.useState([])

  React.useEffect(() => {
    const newVisibleChildren = Array.from(containerRef.current.children)
      .filter(n => !seenNodes.includes(n))
      .filter(n => checkInView(n, containerRef.current))
    if (newVisibleChildren.length) {
      setSeenNodes(seen =>
        Array.from(new Set([...seen, ...newVisibleChildren])),
      )
    }
  }, [containerRef, seenNodes])

  return seenNodes
}

function checkInView(element, container = element.parentElement) {
  const cTop = container.scrollTop
  const cBottom = cTop + container.clientHeight
  const eTop = element.offsetTop - container.offsetTop
  const eBottom = eTop + element.clientHeight
  const isTotal = eTop >= cTop && eBottom <= cBottom
  const isPartial =
    (eTop < cTop && eBottom > cTop) || (eBottom > cBottom && eTop < cBottom)
  return isTotal || isPartial
}

export default App;
