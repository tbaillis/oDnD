console.log('=== SIMPLE CHARACTER CREATION TEST ===');

// Wait for the page to load
setTimeout(() => {
    console.log('Testing character creation modal...');
    
    // Test 1: Check if the modal class is available
    console.log('1. Checking modal availability...');
    if (window.characterCreationModal) {
        console.log('✓ Global characterCreationModal found');
        console.log('Modal type:', typeof window.characterCreationModal);
        console.log('Modal methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.characterCreationModal)));
        
        // Test 2: Try to show the modal
        console.log('2. Attempting to show modal...');
        try {
            window.characterCreationModal.show();
            console.log('✓ Modal show() method called successfully');
            
            // Test 3: Check if modal DOM element exists
            setTimeout(() => {
                const modalElement = document.querySelector('.character-modal-backdrop');
                console.log('3. Modal DOM element exists:', !!modalElement);
                if (modalElement) {
                    console.log('Modal element details:', {
                        className: modalElement.className,
                        style: modalElement.style.cssText,
                        children: modalElement.children.length,
                        isVisible: window.getComputedStyle(modalElement).display !== 'none'
                    });
                } else {
                    console.log('✗ Modal DOM element not found in document');
                }
            }, 100);
            
        } catch (err) {
            console.error('✗ Error calling show():', err);
        }
    } else {
        console.log('✗ Global characterCreationModal not found');
        
        // Check what's available on window
        console.log('Available window properties containing "character":',
            Object.keys(window).filter(k => k.toLowerCase().includes('character')));
        console.log('Available window properties containing "modal":',
            Object.keys(window).filter(k => k.toLowerCase().includes('modal')));
    }
    
    // Test 4: Check CSS loading
    console.log('4. Checking CSS...');
    const testEl = document.createElement('div');
    testEl.className = 'character-modal-backdrop';
    document.body.appendChild(testEl);
    const styles = window.getComputedStyle(testEl);
    console.log('Modal backdrop CSS loaded:', {
        position: styles.position,
        zIndex: styles.zIndex,
        background: styles.background,
        display: styles.display
    });
    document.body.removeChild(testEl);
    
}, 1500);
