/**
 * Investor Type Management
 * Handles retail vs institutional user type selection and routing
 * 
 * ARCHIVED: Retail toggle is currently disabled - launching to institutional clients only
 * To re-enable retail toggle, set RETAIL_ENABLED to true below
 */

(function() {
    'use strict';

    // ARCHIVED: Set to true to re-enable retail toggle functionality
    const RETAIL_ENABLED = false;

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
        const currentPath = window.location.pathname;
        const isInstitutionalPage = currentPath.includes('/institutional/');
        const isRetailPage = currentPath.includes('/retail/');
        
        // Update all navigation links that point to index.html, product.html, or simulator.html
        const navLinks = document.querySelectorAll('a[href="index.html"], a[href="product.html"], a[href="simulator.html"], a[href^="index.html#"], a[href^="product.html#"], a[href^="simulator.html#"]');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Only update if we're not already in the correct directory
            if (type === USER_TYPES.INSTITUTIONAL && !isInstitutionalPage) {
                // User is institutional but on retail/root page - update to institutional paths
                if (href === 'index.html' || href.startsWith('index.html')) {
                    link.href = 'institutional/' + href;
                } else if (href === 'product.html' || href.startsWith('product.html')) {
                    link.href = 'institutional/' + href;
                } else if (href === 'simulator.html' || href.startsWith('simulator.html')) {
                    link.href = 'institutional/' + href;
                }
            } else if (type === USER_TYPES.RETAIL && !isRetailPage && !isInstitutionalPage) {
                // User is retail but on root page - update to retail paths
                if (href === 'index.html' || href.startsWith('index.html')) {
                    link.href = 'retail/' + href;
                } else if (href === 'product.html' || href.startsWith('product.html')) {
                    link.href = 'retail/' + href;
                } else if (href === 'simulator.html' || href.startsWith('simulator.html')) {
                    link.href = 'retail/' + href;
                }
            }
            // If already in correct directory, links are already correct (relative paths work)
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
     * ARCHIVED: Disabled when RETAIL_ENABLED is false
     */
    function handleInvestorTypeToggle() {
        // ARCHIVED: Retail toggle disabled - do nothing
        if (!RETAIL_ENABLED) {
            return;
        }
        
        const currentType = getUserType();
        const newType = currentType === USER_TYPES.RETAIL ? USER_TYPES.INSTITUTIONAL : USER_TYPES.RETAIL;
        setUserType(newType);
        
        // Determine current path and redirect accordingly
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';
        
        // Map equivalent pages between retail and institutional
        const pageMap = {
            'index.html': 'index.html',
            'product.html': 'product.html',
            'simulator.html': 'simulator.html'
        };
        
        if (currentPath.includes('retail/')) {
            // Switching from retail to institutional
            const targetFile = pageMap[currentFile] || 'index.html';
            window.location.href = '/institutional/' + targetFile;
        } else if (currentPath.includes('institutional/')) {
            // Switching from institutional to retail
            const targetFile = pageMap[currentFile] || 'index.html';
            window.location.href = '/retail/' + targetFile;
        } else {
            // On root pages - redirect to appropriate homepage
            if (newType === USER_TYPES.INSTITUTIONAL) {
                window.location.href = '/institutional/index.html';
            } else {
                window.location.href = '/retail/index.html';
            }
        }
    }

    /**
     * Initialize investor type functionality
     * ARCHIVED: Auto-sets to institutional when RETAIL_ENABLED is false
     */
    function init() {
        // ARCHIVED: Auto-set to institutional if retail is disabled and this is first visit
        if (!RETAIL_ENABLED && isFirstVisit()) {
            setUserType(USER_TYPES.INSTITUTIONAL);
        }

        // Check if we're on the root index.html (gate page)
        const isRootPage = window.location.pathname.endsWith('index.html') || 
                          window.location.pathname.endsWith('/') ||
                          window.location.pathname === '/Users/caseykemp/First-Principle/index.html';

        // ARCHIVED: Only show gate if retail is enabled
        if (RETAIL_ENABLED && isFirstVisit() && isRootPage) {
            showInvestorGate();
        }

        // Set up event listeners (only if retail is enabled)
        if (RETAIL_ENABLED) {
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
        }

        // Update navigation on pages that have it
        if (document.querySelector('.nav')) {
            updateNavigationLinks();
            updateInvestorTypeIndicator();
            
            // ARCHIVED: Disable toggle indicator click if retail is disabled
            if (!RETAIL_ENABLED) {
                const indicator = document.getElementById('investor-type-indicator');
                if (indicator) {
                    indicator.style.cursor = 'default';
                    indicator.style.opacity = '0.7';
                    indicator.title = 'Institutional mode (retail toggle disabled)';
                }
            }
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

