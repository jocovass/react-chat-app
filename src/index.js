import React from 'react';
import ReactDOM from 'react-dom';
import {ErrorBoundary} from 'react-error-boundary'
import Chat, {ErrorFallback} from './Chat'


ReactDOM.render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Chat />
    </ErrorBoundary>,
  document.getElementById('root')
);
