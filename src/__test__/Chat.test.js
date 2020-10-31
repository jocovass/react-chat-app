import React from 'react'
import { render, screen, act, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {subscribe, addMessage} from '../fb';
import Chat from '../Chat'

jest.mock('../fb.js', () => {
    return {
        subscribe: jest.fn(),
        addMessage: jest.fn(),
    }
})

beforeAll(() => {
    window.navigator.geolocation = {
        getCurrentPosition: jest.fn(),
      }
    window.HTMLElement.prototype.scroll = jest.fn()
})

afterEach(() => {
    jest.clearAllMocks();
  });
afterEach(cleanup)

const defered = () => {
    let resolved;
    let rejected;
    const promise = new Promise((res, rej) => {
        resolved = res;
        rejected = rej;
    })
    return {resolved, rejected, promise};
}

test('Initial render is correct', () => {
    render(<Chat />)
    screen.getByLabelText(/username/i);
    screen.getByLabelText(/message/i);
    screen.getByText(/send/i);
    expect(screen.getByTestId(/coords/i)).toHaveTextContent('NO LOCATION DATA')
    const chatBox = screen.getByTestId(/box/i);
    const noMessageContent = screen.getByText(/messages/i);
    expect(chatBox).toContainElement(noMessageContent);
})


const position = {
    coords: {
    latitude:23456,
    longitude:78901,
    }
};

test('Can subscribe to the channel successfully', async () => {
    const {resolved, rejected, promise} = defered();
    window.navigator.geolocation.getCurrentPosition.mockImplementation((cb) => {
        promise.then(() => cb(position));
    })

    render(<Chat />)
    await act(() => {
        resolved();
        return promise;
    })

    expect(screen.getByTestId(/coords/i)).toHaveTextContent('{ "latitude": 23456, "longitude": 78901 }');
    expect(subscribe).toBeCalledTimes(1);
    userEvent.type(screen.getByLabelText(/username/i), 'Nora')
    userEvent.type(screen.getByLabelText(/message/i), 'Hello World')
        userEvent.click(screen.getByText(/send/i))
    expect(addMessage).toBeCalledTimes(1);
})
