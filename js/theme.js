/**
 * Theme Toggle Module
 * Handles dark/light mode switching with localStorage persistence
 * and system preference detection
 *
 * @author Maryam Aladsani
 * @version 2.0
 */

(function() {
    'use strict';

    // Constants
    const STORAGE_KEY = 'theme';
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';
    const LIGHT_CLASS = 'theme-light';

    // DOM Elements
    const root = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');

    // Exit early if toggle button doesn't exist
    if (!toggleBtn) {
        console.warn('[Theme] Toggle button not found');
        return;
    }

    /**
     * Safely check if localStorage is available
     * @returns {boolean}
     */
    function canUseStorage() {
        try {
            const testKey = '__theme_test__';
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get saved theme from localStorage
     * @returns {string|null}
     */
    function getSavedTheme() {
        if (!canUseStorage()) return null;
        return localStorage.getItem(STORAGE_KEY);
    }

    /**
     * Save theme preference to localStorage
     * @param {string} theme
     */
    function saveTheme(theme) {
        if (!canUseStorage()) return;
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            console.warn('[Theme] Failed to save preference:', e);
        }
    }

    /**
     * Detect system color scheme preference
     * @returns {string}
     */
    function getSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return THEME_LIGHT;
        }
        return THEME_DARK;
    }

    /**
     * Apply theme to document
     * @param {string} theme - 'light' or 'dark'
     */
    function applyTheme(theme) {
        const isLight = theme === THEME_LIGHT;

        // Update DOM
        root.classList.toggle(LIGHT_CLASS, isLight);

        // Update button
        toggleBtn.textContent = isLight ? '☀️' : '🌙';
        toggleBtn.setAttribute('aria-pressed', isLight.toString());
        toggleBtn.setAttribute('aria-label',
            isLight ? 'Switch to dark mode' : 'Switch to light mode'
        );

        // Update meta theme-color for mobile browsers
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', isLight ? '#f8fafc' : '#00343a');
        }
    }

    /**
     * Get current theme
     * @returns {string}
     */
    function getCurrentTheme() {
        return root.classList.contains(LIGHT_CLASS) ? THEME_LIGHT : THEME_DARK;
    }

    /**
     * Toggle between themes
     */
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;

        applyTheme(newTheme);
        saveTheme(newTheme);
    }

    /**
     * Initialize theme system
     */
    function init() {
        // Determine initial theme: saved > system preference > dark
        const savedTheme = getSavedTheme();
        const initialTheme = savedTheme || getSystemPreference();

        // Apply initial theme
        applyTheme(initialTheme);

        // Listen for toggle clicks
        toggleBtn.addEventListener('click', toggleTheme);

        // Listen for system preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

            // Modern browsers
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', (e) => {
                    // Only auto-switch if user hasn't set a preference
                    if (!getSavedTheme()) {
                        applyTheme(e.matches ? THEME_LIGHT : THEME_DARK);
                    }
                });
            }
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();