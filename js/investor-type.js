/**
 * Investor Type Management
 * Handles retail vs institutional user type selection and routing
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'fp_user_type';
    const USER_TYPES = {
        RETAIL: 'retail',
        INSTITUTIONAL: 'institutional'
    };

    /**
     * Get the current user type from localStorage
     * @returns {string|null} 'retail', 'institutional', or null
     */
    function getUserType() {
        return localStorage.getItem(STORAGE_KEY);
    }

    /**
     * Set the user type in localStorage
     * @param {string} type - 'retail' or 'institutional'
     */
    function setUserType(type) {
        if (type === USER_TYPES.RETAIL || type === USER_TYPES.INSTITUTIONAL) {
            localStorage.setItem(STORAGE_KEY, type);
        }
    }

    /**
     * Check if this is the first visit (no user type set)
     * @returns {boolean}
     */
    function isFirstVisit() {
        return getUserType() === null;
    }

    /**
     * Get the base path for the current user type
     * @returns {string} '' for retail, 'institutional/' for institutional
     */
    function getBasePath() {
        const type = getUserType();
        return type === USER_TYPES.INSTITUTIONAL ? 'institutional/' : '';
    }

    /**
     * Redirect to the appropriate homepage based on user type
     */
    function redirectToHomepage() {
        const type = getUserType();
        const currentPath = window.location.pathname;
        const isRoot = currentPath.endsWith('/') || currentPath.endsWith('index.html') || currentPath.includes('/index.html');
        
        if (isRoot && !currentPath.includes('retail/') && !currentPath.includes('institutional/')) {
            // We're on the root gate page
            if (type === USER_TYPES.INSTITUTIONAL) {
                window.location.href = 'institutional/index.html';
            } else {
                // Default to retail
                window.location.href = 'retail/index.html';
            }
        }
    }

    /**
     * Update navigation links based on user type
     */
    function updateNavigationLinks() {
        const type = getUserType();
        const basePath = getBasePath();
        
        // Update all navigation links
        const navLinks = document.querySelectorAll('a[href^="index.html"], a[href^="product.html"], a[href^="simulator.html"]');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === 'index.html') {
                link.href = basePath + 'index.html';
            } else if (href === 'product.html') {
                link.href = basePath + 'product.html';
            } else if (href === 'simulator.html') {
                link.href = basePath + 'simulator.html';
            }
        });
    }

    /**
     * Update the investor type indicator in the nav
     */
    function updateInvestorTypeIndicator() {
        const type = getUserType();
        const indicator = document.getElementById('investor-type-indicator');
        if (indicator) {
            indicator.textContent = type === USER_TYPES.INSTITUTIONAL ? 'Institutional' : 'Individual';
            indicator.className = 'investor-type-indicator ' + (type === USER_TYPES.INSTITUTIONAL ? 'institutional' : 'retail');
        }
    }

    /**
     * Show the investor type gate modal
     */
    function showInvestorGate() {
        const modal = document.getElementById('investor-gate-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide the investor type gate modal
     */
    function hideInvestorGate() {
        const modal = document.getElementById('investor-gate-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Handle investor type selection
     * @param {string} type - 'retail' or 'institutional'
     */
    function handleInvestorTypeSelection(type) {
        setUserType(type);
        hideInvestorGate();
        redirectToHomepage();
    }

    /**
     * Handle manual investor type toggle
     */
    function handleInvestorTypeToggle() {
        const currentType = getUserType();
        const newType = currentType === USER_TYPES.RETAIL ? USER_TYPES.INSTITUTIONAL : USER_TYPES.RETAIL;
        setUserType(newType);
        
        // Determine current path and redirect accordingly
        const currentPath = window.location.pathname;
        if (currentPath.includes('retail/')) {
            window.location.href = currentPath.replace('retail/', 'institutional/');
        } else if (currentPath.includes('institutional/')) {
            window.location.href = currentPath.replace('institutional/', 'retail/');
        } else {
            // Fallback to homepage
            if (newType === USER_TYPES.INSTITUTIONAL) {
                window.location.href = 'institutional/index.html';
            } else {
                window.location.href = 'retail/index.html';
            }
        }
    }

    /**
     * Initialize investor type functionality
     */
    function init() {
        // Check if we're on the root index.html (gate page)
        const isRootPage = window.location.pathname.endsWith('index.html') || 
                          window.location.pathname.endsWith('/') ||
                          window.location.pathname === '/Users/caseykemp/First-Principle/index.html';

        // If first visit and on root, show gate
        if (isFirstVisit() && isRootPage) {
            showInvestorGate();
        }

        // Set up event listeners
        const retailBtn = document.getElementById('investor-gate-retail');
        const institutionalBtn = document.getElementById('investor-gate-institutional');
        const toggleBtn = document.getElementById('investor-type-toggle');

        if (retailBtn) {
            retailBtn.addEventListener('click', () => handleInvestorTypeSelection(USER_TYPES.RETAIL));
        }

        if (institutionalBtn) {
            institutionalBtn.addEventListener('click', () => handleInvestorTypeSelection(USER_TYPES.INSTITUTIONAL));
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', handleInvestorTypeToggle);
        }

        // Update navigation on pages that have it
        if (document.querySelector('.nav')) {
            updateNavigationLinks();
            updateInvestorTypeIndicator();
        }
    }

    // Export functions to global scope
    window.FPInvestorType = {
        getUserType,
        setUserType,
        isFirstVisit,
        getBasePath,
        redirectToHomepage,
        updateNavigationLinks,
        updateInvestorTypeIndicator,
        handleInvestorTypeToggle
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

