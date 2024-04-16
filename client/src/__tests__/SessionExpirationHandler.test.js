import React from 'react';
import { render, act } from '@testing-library/react';
import SessionExpirationHandler from '../components/SessionExpirationHandler';

// Set the test environment to jsdom for this test file
/**
 * @jest-environment jsdom
 */

// Mock ipfs-http-client module
jest.mock('../../ipfs.jsx', () => ({
  create: jest.fn().mockReturnValue({}),
}));

jest.mock('../helpers/web3Client', () => ({
  useWeb3: () => ({
    logOut: jest.fn(),
  }),
}));

jest.useFakeTimers(); // Mock timers

describe('SessionExpirationHandler', () => {
  let handleSessionExpireMock;

  beforeEach(() => {
    handleSessionExpireMock = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('handleSessionExpire', () => {
    describe('when the session expires', () => {
        it('should call the handleSessionExpire', () => {
            // Arrange
            render(<SessionExpirationHandler handleSessionExpire={handleSessionExpireMock} />);
            act(() => {
                jest.advanceTimersByTime(1000); // Simulate 1 second of user inactivity
            });
            expect(handleSessionExpireMock).not.toHaveBeenCalled();

            // Act
            act(() => {
                jest.advanceTimersByTime(3600000); // Simulate 1 hour passing
            });

            // Assert
            expect(handleSessionExpireMock).toHaveBeenCalled();
        });
    });
    describe('when the user activity occurs within the session time', () => {
        it('should not call the handleSessionsExpire', () => {
            // Arrange
            render(<SessionExpirationHandler handleSessionExpire={handleSessionExpireMock} />);
            act(() => {
            jest.advanceTimersByTime(1000); // Simulate 1 second of user inactivity
            });
            expect(handleSessionExpireMock).not.toHaveBeenCalled();

            // Act 
            act(() => {
                jest.advanceTimersByTime(300000); // Simulate 5 minutes passing
            });

            // Assert
            expect(handleSessionExpireMock).not.toHaveBeenCalled();
        });
    });
  });

});
