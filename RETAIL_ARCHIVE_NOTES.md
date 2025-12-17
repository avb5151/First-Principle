# Retail Toggle Archive Notes

## Status
**Retail/Individual Investor toggle is currently ARCHIVED and disabled.**
The site now automatically routes to the institutional experience.

## What Was Changed

### 1. `index.html`
- The investor type gate modal is commented out
- Auto-redirects to `institutional/index.html` on load
- All retail code is preserved in comments for easy restoration

### 2. `js/investor-type.js`
- Added `RETAIL_ENABLED` flag (currently set to `false`)
- Auto-sets user type to 'institutional' on first visit when retail is disabled
- Toggle function returns early when retail is disabled
- Investor type indicator is made non-clickable (cursor: default, reduced opacity)
- All retail code is preserved and functional - just gated behind the flag

### 3. Institutional Pages
- `institutional/index.html` - Toggle handler commented out
- `institutional/product.html` - Toggle handler commented out  
- `institutional/simulator.html` - Toggle handler commented out

## How to Re-enable Retail Toggle

To quickly reconnect the retail experience:

1. **In `js/investor-type.js`:**
   - Change `const RETAIL_ENABLED = false;` to `const RETAIL_ENABLED = true;`

2. **In `index.html`:**
   - Uncomment the investor gate modal HTML (lines 22-34)
   - Replace the auto-redirect script with the original modal display code

3. **In institutional pages:**
   - Uncomment the toggle handler scripts in:
     - `institutional/index.html`
     - `institutional/product.html`
     - `institutional/simulator.html`

4. **Test:**
   - Clear localStorage or use incognito mode
   - Visit root `index.html` - should show the gate modal
   - Test both retail and institutional paths

## Retail Files Preserved
All retail files remain intact and functional:
- `retail/index.html`
- `retail/product.html`
- `retail/simulator.html`

These can be accessed directly via URL even when the toggle is disabled, but won't be accessible through the normal user flow.

## Notes
- The investor type indicator still appears in navigation but is non-clickable
- All retail functionality is preserved in the codebase
- No retail files were deleted or modified
- Easy to toggle back on with the steps above
