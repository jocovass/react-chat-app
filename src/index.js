import React from 'react';
import ReactDOM from 'react-dom';
import {ErrorBoundary} from 'react-error-boundary'
import Chat from './Chat'

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

ReactDOM.render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Chat />
    </ErrorBoundary>,
  document.getElementById('root')
);
