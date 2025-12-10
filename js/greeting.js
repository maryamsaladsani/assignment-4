/**
 * Personalized Greeting Module
 * Shows modal popup on first visit, simple greeting afterwards
 *
 * @author Maryam Aladsani
 * @version 3.0
 */

(function() {
    'use strict';

    // Constants
    const STORAGE_KEY = 'username';
    const MIN_NAME_LENGTH = 2;
    const MAX_NAME_LENGTH = 50;

    // DOM Elements
    const greetingEl = document.getElementById('greeting');

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
            .replace(/[<>'"&]/g, '');
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
     * Update the greeting display (simple one-line)
     */
    function updateGreeting() {
        const name = getSavedName();
        const timeGreeting = getTimeGreeting();

        greetingEl.textContent = name
            ? `${timeGreeting}, ${name}!`
            : `${timeGreeting}!`;
    }

    /**
     * Create and show the welcome modal
     */
    function showWelcomeModal() {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'greeting-modal-overlay';
        overlay.innerHTML = `
            <div class="greeting-modal" role="dialog" aria-labelledby="modal-title" aria-modal="true">
                <h2 id="modal-title">Welcome! 👋</h2>
                <p>What should I call you?</p>
                <form id="modalNameForm" autocomplete="off">
                    <input 
                        type="text" 
                        id="modalNameInput" 
                        placeholder="Enter your name..."
                        minlength="2"
                        maxlength="50"
                        required
                        autofocus
                    >
                    <div class="modal-buttons">
                        <button type="button" class="modal-skip">Skip</button>
                        <button type="submit" class="modal-save">Continue</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Get modal elements
        const modal = overlay.querySelector('.greeting-modal');
        const form = overlay.querySelector('#modalNameForm');
        const input = overlay.querySelector('#modalNameInput');
        const skipBtn = overlay.querySelector('.modal-skip');

        // Focus input
        setTimeout(() => input.focus(), 100);

        // Handle form submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const sanitized = sanitizeName(input.value);

            if (isValidName(sanitized)) {
                saveName(sanitized);
                closeModal();
                updateGreeting();
            } else {
                input.classList.add('input-error');
                input.focus();
            }
        });

        // Handle skip
        skipBtn.addEventListener('click', () => {
            // Save empty string to indicate user has seen the modal
            saveName('');
            closeModal();
            updateGreeting();
        });

        // Handle input validation feedback
        input.addEventListener('input', () => {
            input.classList.remove('input-error');
        });

        // Close modal on overlay click (not modal itself)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                saveName('');
                closeModal();
                updateGreeting();
            }
        });

        // Close modal on Escape key
        function escHandler(e) {
            if (e.key === 'Escape') {
                saveName('');
                closeModal();
                updateGreeting();
                document.removeEventListener('keydown', escHandler);
            }
        }
        document.addEventListener('keydown', escHandler);

        function closeModal() {
            overlay.classList.remove('active');
            overlay.classList.add('closing');
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Initialize greeting module
     */
    function init() {
        const savedName = getSavedName();

        // If no saved name (first visit), show modal
        if (savedName === null) {
            showWelcomeModal();
        } else {
            // Otherwise just show the greeting
            updateGreeting();
        }

        // Update greeting on visibility change
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