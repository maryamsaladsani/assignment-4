/**
 * Personalized Greeting Module
 * Displays time-based greeting with optional saved username
 *
 * @author Maryam Aladsani
 * @version 2.0
 */

(function() {
    'use strict';

    // Constants
    const STORAGE_KEY = 'username';
    const MIN_NAME_LENGTH = 2;
    const MAX_NAME_LENGTH = 50;

    // DOM Elements
    const greetingEl = document.getElementById('greeting');
    const form = document.getElementById('usernameForm');
    const input = document.getElementById('usernameInput');
    const changeBtn = document.getElementById('changeNameBtn');

    // Exit early if required elements don't exist
    if (!greetingEl) {
        console.warn('[Greeting] Greeting element not found');
        return;
    }

    /**
     * Safely check if localStorage is available
     * @returns {boolean}
     */
    function canUseStorage() {
        try {
            const testKey = '__greeting_test__';
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get the time-based greeting
     * @returns {string}
     */
    function getTimeGreeting() {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            return 'Good afternoon';
        } else if (hour >= 17 && hour < 21) {
            return 'Good evening';
        } else {
            return 'Hello';
        }
    }

    /**
     * Get saved username from localStorage
     * @returns {string|null}
     */
    function getSavedName() {
        if (!canUseStorage()) return null;
        return localStorage.getItem(STORAGE_KEY);
    }

    /**
     * Save username to localStorage
     * @param {string} name
     */
    function saveName(name) {
        if (!canUseStorage()) return;
        try {
            localStorage.setItem(STORAGE_KEY, name);
        } catch (e) {
            console.warn('[Greeting] Failed to save name:', e);
        }
    }

    /**
     * Sanitize user input
     * @param {string} input
     * @returns {string}
     */
    function sanitizeName(input) {
        return input
            .trim()
            .slice(0, MAX_NAME_LENGTH)
            .replace(/[<>'"&]/g, ''); // Remove potentially dangerous characters
    }

    /**
     * Validate name
     * @param {string} name
     * @returns {boolean}
     */
    function isValidName(name) {
        return name.length >= MIN_NAME_LENGTH && name.length <= MAX_NAME_LENGTH;
    }

    /**
     * Update the greeting display
     */
    function updateGreeting() {
        const name = getSavedName();
        const timeGreeting = getTimeGreeting();

        greetingEl.textContent = name
            ? `${timeGreeting}, ${name}!`
            : `${timeGreeting}!`;

        // Toggle form visibility
        const hasName = Boolean(name);
        if (form) {
            form.classList.toggle('hidden', hasName);
        }
        if (changeBtn) {
            changeBtn.classList.toggle('hidden', !hasName);
        }
    }

    /**
     * Handle form submission
     * @param {Event} event
     */
    function handleSubmit(event) {
        event.preventDefault();

        if (!input) return;

        const sanitized = sanitizeName(input.value);

        if (isValidName(sanitized)) {
            saveName(sanitized);
            input.value = '';
            updateGreeting();
        } else {
            // Provide feedback for invalid input
            input.setAttribute('aria-invalid', 'true');
            input.focus();
        }
    }

    /**
     * Handle change name button click
     */
    function handleChangeName() {
        if (form) {
            form.classList.remove('hidden');
        }
        if (input) {
            input.focus();
        }
    }

    /**
     * Initialize greeting module
     */
    function init() {
        // Set up form submission
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }

        // Set up change name button
        if (changeBtn) {
            changeBtn.addEventListener('click', handleChangeName);
        }

        // Set up input validation feedback
        if (input) {
            input.addEventListener('input', () => {
                input.setAttribute('aria-invalid', 'false');
            });
        }

        // Initial render
        updateGreeting();

        // Update greeting on visibility change (if user returns to tab)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                updateGreeting();
            }
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();