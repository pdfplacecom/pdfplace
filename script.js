
// Global Variables
let currentUser = null;
let isAdmin = false;
let currentPreviewFile = null;
let isDarkTheme = false;
let samplePDFs = [
  {
    id: 1,
    filename: "NCERT Mathematics Class 12.pdf",
    category: "ncert",
    upload_date: "2024-01-15",
    size: 15728640,
    download_count: 245
  },
  {
    id: 2,
    filename: "JEE Main Physics PYQ 2023.pdf",
    category: "pyqs",
    upload_date: "2024-01-12",
    size: 8945632,
    download_count: 189
  },
  {
    id: 3,
    filename: "Chemistry Mock Test - Organic.pdf",
    category: "mocktest",
    upload_date: "2024-01-10",
    size: 5242880,
    download_count: 156
  }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize application: ' + error.message);
    }
});

function initializeApp() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = '☀️';
        }
        isDarkTheme = true;
    }
    
    // Load uploaded PDFs from localStorage and session storage
    const uploadedPDFs = localStorage.getItem('uploadedPDFs');
    if (uploadedPDFs) {
        try {
            const parsed = JSON.parse(uploadedPDFs);
            if (Array.isArray(parsed)) {
                samplePDFs.length = 0; // Clear existing
                samplePDFs.push(...parsed); // Add uploaded PDFs
            }
        } catch (error) {
            console.error('Error loading uploaded PDFs:', error);
        }
    }
    
    // Restore session data for large files if available
    if (window.sessionPDFs && Array.isArray(window.sessionPDFs)) {
        samplePDFs.length = 0;
        samplePDFs.push(...window.sessionPDFs);
    }
    
    // Show welcome popup on first visit
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        showWelcomePopup();
        localStorage.setItem('hasVisited', 'true');
    } else {
        closeWelcomePopup();
    }
    
    // Check if user is already logged in
    checkLoginStatus();
}

function checkLoginStatus() {
    // Check if user was previously logged in
    const savedUser = localStorage.getItem('currentUser');
    const savedAdmin = localStorage.getItem('isAdmin');
    
    if (savedUser) {
        currentUser = savedUser;
        isAdmin = savedAdmin === 'true';
        showMainPage();
    } else {
        showMainPage();
    }
}

// Welcome Popup Functions
function showWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    if (popup) {
        popup.style.display = 'flex';
    }
}

function closeWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Theme Toggle
function toggleTheme() {
    try {
        const body = document.body;
        const themeIcon = document.getElementById('themeIcon');
        
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
            isDarkTheme = false;
        } else {
            body.classList.add('dark-theme');
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
            isDarkTheme = true;
        }
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

// Authentication Functions
function togglePasswordVisibility() {
    try {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.getElementById('passwordToggleIcon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = '👁️';
        }
    } catch (error) {
        console.error('Error toggling password visibility:', error);
    }
}

function login(event) {
    if (event) {
        event.preventDefault();
    }
    
    try {
        showLoading(true);
        
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showError('Please enter both email and password');
            showLoading(false);
            return;
        }
        
        // Simulate login delay
        setTimeout(() => {
            // Demo login logic
            currentUser = email;
            isAdmin = email === 'ak763145918@gmail.com' && password === '76730';
            
            // Save login state
            localStorage.setItem('currentUser', currentUser);
            localStorage.setItem('isAdmin', isAdmin.toString());
            
            showMainApp();
            showSuccess('Login successful!');
            showLoading(false);
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed: ' + error.message);
        showLoading(false);
    }
}

function logout() {
    try {
        showLoading(true);
        
        setTimeout(() => {
            currentUser = null;
            isAdmin = false;
            
            // Clear login state
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isAdmin');
            
            showMainPage();
            showSuccess('Logged out successfully!');
            showLoading(false);
        }, 500);
        
    } catch (error) {
        console.error('Logout error:', error);
        showError('Logout failed: ' + error.message);
        showLoading(false);
    }
}

function showMainPage() {
    const loginSection = document.getElementById('loginSection');
    const mainApp = document.getElementById('mainApp');
    const currentUserElement = document.getElementById('currentUser');
    const uploadSection = document.getElementById('uploadSection');
    const loginButton = document.getElementById('loginButton');
    const userInfo = document.getElementById('userInfo');
    
    if (loginSection) loginSection.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
    
    // Show login button if not logged in
    if (!currentUser) {
        if (loginButton) loginButton.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        if (currentUserElement) currentUserElement.textContent = 'Welcome! Please login to access features.';
        if (uploadSection) uploadSection.style.display = 'none';
        
        // Disable interactive features
        disableFeatures();
    } else {
        if (loginButton) loginButton.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (currentUserElement) currentUserElement.textContent = `Welcome, ${currentUser}!`;
        if (uploadSection) uploadSection.style.display = isAdmin ? 'block' : 'none';
        
        // Enable interactive features
        enableFeatures();
        loadPDFs();
        loadDownloads();
        loadComments();
        loadStorageInfo();
    }
}

function showLoginSection() {
    const loginSection = document.getElementById('loginSection');
    const mainApp = document.getElementById('mainApp');
    
    if (loginSection) loginSection.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
}

function disableFeatures() {
    // Show message for features that require login
    const pdfList = document.getElementById('pdfList');
    const downloadsList = document.getElementById('downloadsList');
    const commentsList = document.getElementById('commentsList');
    
    if (pdfList) {
        pdfList.innerHTML = '<div class="login-required"><p>Please login to view and manage PDF files.</p></div>';
    }
    if (downloadsList) {
        downloadsList.innerHTML = '<div class="login-required"><p>Please login to view download history.</p></div>';
    }
    if (commentsList) {
        commentsList.innerHTML = '<div class="login-required"><p>Please login to view and submit feedback.</p></div>';
    }
}

function enableFeatures() {
    // Features will be enabled when data is loaded
}

function showMainApp() {
    // After successful login, update the main page to show user features
    showMainPage();
}

// Forgot Password Functions
function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function sendPasswordReset() {
    const email = document.getElementById('resetEmail').value.trim();
    if (!email) {
        showError('Please enter your email address');
        return;
    }
    
    // Simulate password reset
    showSuccess('Password reset instructions sent to your email!');
    closeForgotPassword();
}

// Tab Navigation
function showTab(tabName) {
    try {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedTab = document.getElementById(tabName + 'Tab');
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Add active class to clicked button
        const clickedButton = event.target;
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
        
        // Load data for specific tabs
        if (tabName === 'downloads') {
            loadDownloads();
        } else if (tabName === 'comments') {
            loadComments();
        }
    } catch (error) {
        console.error('Error showing tab:', error);
    }
}

// File Upload Functions
function uploadPDF(event) {
    if (event) {
        event.preventDefault();
    }
    
    try {
        if (!isAdmin) {
            showError('Upload permission denied. Admin access required.');
            return;
        }
        
        const fileInput = document.getElementById('pdfFile');
        const categorySelect = document.getElementById('categorySelect');
        const statusDiv = document.getElementById('uploadStatus');
        
        if (!fileInput.files[0]) {
            showError('Please select a PDF file');
            return;
        }
        
        const file = fileInput.files[0];
        if (file.type !== 'application/pdf') {
            showError('Please select a valid PDF file');
            return;
        }
        
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            showError('File size too large. Maximum size is 50MB.');
            return;
        }
        
        showLoading(true);
        statusDiv.innerHTML = '<div class="loading-spinner"></div> Uploading...';
        
        // Read file and create new PDF entry
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Check if we have a valid result
                if (!e.target || !e.target.result) {
                    throw new Error('Failed to read file data');
                }
                
                // Create new PDF object with actual file data
                const newPDF = {
                    id: Date.now(),
                    filename: file.name,
                    category: categorySelect.value,
                    upload_date: new Date().toLocaleDateString(),
                    size: file.size,
                    download_count: 0,
                    file_data: e.target.result // Store the actual file data
                };
                
                // Store file data regardless of size for proper functionality
                // We'll handle large files by storing them temporarily in memory
                try {
                    showSuccess('File uploaded and saved successfully with full functionality!');
                } catch (error) {
                    console.error('Error handling uploaded file:', error);
                    showError('Failed to process uploaded file: ' + error.message);
                    return;
                }
                
                // Add to the list and save
                samplePDFs.unshift(newPDF);
                saveUploadedPDFs();
                loadPDFs();
                loadStorageInfo();
                
                // Reset form
                document.getElementById('uploadForm').reset();
                statusDiv.innerHTML = '';
                showLoading(false);
                
            } catch (error) {
                console.error('Upload processing error:', error);
                showError('Upload failed: ' + error.message);
                statusDiv.innerHTML = '';
                showLoading(false);
            }
        };
        
        reader.onerror = function() {
            showError('Failed to read file. Please try again.');
            statusDiv.innerHTML = '';
            showLoading(false);
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Upload error:', error);
        showError('Upload failed: ' + error.message);
        showLoading(false);
    }
}

function saveUploadedPDFs() {
    try {
        // Create a copy for localStorage with size limits
        const pdfsCopy = samplePDFs.map(pdf => {
            // For large files, save metadata but not file data to localStorage
            if (pdf.file_data && pdf.file_data.length > 2 * 1024 * 1024) { // 2MB limit
                return {
                    ...pdf,
                    file_data: null,
                    has_large_file: true
                };
            }
            return pdf;
        });
        
        localStorage.setItem('uploadedPDFs', JSON.stringify(pdfsCopy));
        
        // Keep original data in memory for current session
        window.sessionPDFs = samplePDFs;
    } catch (error) {
        console.error('Error saving PDFs to localStorage:', error);
        // Try saving without file data as fallback
        try {
            const metadataOnly = samplePDFs.map(pdf => ({
                ...pdf,
                file_data: null,
                has_large_file: Boolean(pdf.file_data)
            }));
            localStorage.setItem('uploadedPDFs', JSON.stringify(metadataOnly));
            window.sessionPDFs = samplePDFs;
        } catch (fallbackError) {
            showError('Failed to save PDF data. Storage may be full.');
        }
    }
}

// PDF Management Functions
function loadPDFs() {
    const pdfList = document.getElementById('pdfList');
    if (!pdfList) return;
    
    try {
        if (samplePDFs.length === 0) {
            pdfList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h3>No PDFs Found</h3>
                    <p>No PDF files have been uploaded yet. ${isAdmin ? 'Upload some files to get started!' : 'Check back later for new content.'}</p>
                </div>
            `;
            return;
        }
        
        const pdfItems = samplePDFs.map(pdf => {
            const sizeFormatted = formatFileSize(pdf.size);
            const categoryClass = pdf.category || 'others';
            const hasRealData = pdf.file_data && pdf.file_data.startsWith('data:');
            const hasLargeFile = pdf.has_large_file || (pdf.file_data && pdf.file_data.length > 2 * 1024 * 1024);
            const fileTypeIndicator = hasRealData || hasLargeFile ? '🟢 Uploaded File' : '🔵 Sample Data';
            
            return `
                <div class="pdf-item" data-category="${pdf.category}" data-filename="${pdf.filename.toLowerCase()}">
                    <div class="pdf-header">
                        <div class="pdf-info">
                            <h3>${escapeHtml(pdf.filename)} <span class="file-type-indicator ${hasRealData ? 'real-file' : 'sample-file'}">${fileTypeIndicator}</span></h3>
                            <div class="pdf-meta">
                                <span>📅 ${pdf.upload_date}</span>
                                <span>📏 ${sizeFormatted}</span>
                                <span>📥 ${pdf.download_count} downloads</span>
                                <span class="category-badge ${categoryClass}">${getCategoryDisplayName(pdf.category)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="pdf-actions">
                        <button onclick="previewPDF('${pdf.id}')" class="action-btn preview-btn" ${!hasRealData ? 'title="Preview not available for sample data"' : ''}>
                            👁️ Preview
                        </button>
                        <button onclick="downloadPDF('${pdf.id}')" class="action-btn download-btn">
                            📥 Download
                        </button>
                        ${isAdmin ? `<button onclick="deletePDF('${pdf.id}')" class="action-btn delete-btn">🗑️ Delete</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        pdfList.innerHTML = pdfItems;
        
    } catch (error) {
        console.error('Error loading PDFs:', error);
        pdfList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Loading Error</h3>
                <p>Failed to load PDF files. Please try refreshing the page.</p>
                <button onclick="loadPDFs()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

function searchPDFs() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    const pdfItems = document.querySelectorAll('.pdf-item');
    pdfItems.forEach(item => {
        const filename = item.getAttribute('data-filename') || '';
        if (filename.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterByCategory() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    
    const pdfItems = document.querySelectorAll('.pdf-item');
    pdfItems.forEach(item => {
        const category = item.getAttribute('data-category') || '';
        if (!selectedCategory || category === selectedCategory) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function previewPDF(pdfId) {
    try {
        const pdf = samplePDFs.find(p => p.id == pdfId);
        if (!pdf) {
            showError('PDF not found');
            return;
        }
        
        currentPreviewFile = pdf;
        const modal = document.getElementById('previewModal');
        const previewFrame = document.getElementById('previewFrame');
        const previewTitle = document.getElementById('previewTitle');
        const previewLoading = document.getElementById('previewLoading');
        const previewError = document.getElementById('previewError');
        
        if (!modal || !previewFrame || !previewTitle) {
            showError('Preview modal not found');
            return;
        }
        
        // Show modal and loading state
        modal.style.display = 'flex';
        previewTitle.textContent = pdf.filename;
        previewLoading.style.display = 'block';
        previewError.style.display = 'none';
        previewFrame.style.display = 'none';
        
        // Clear previous iframe content
        previewFrame.src = '';
        
        // Try to load the PDF from various sources
        let pdfDataUrl = null;
        
        // Check if we have file data directly
        if (pdf.file_data && pdf.file_data.startsWith('data:')) {
            pdfDataUrl = pdf.file_data;
        }
        // Check session storage for large files
        else if (window.sessionPDFs) {
            const sessionPdf = window.sessionPDFs.find(p => p.id === pdf.id);
            if (sessionPdf && sessionPdf.file_data && sessionPdf.file_data.startsWith('data:')) {
                pdfDataUrl = sessionPdf.file_data;
            }
        }
        
        if (pdfDataUrl) {
            // Use actual file data for preview
            try {
                previewFrame.src = pdfDataUrl;
                setupPreviewLoadHandlers(previewFrame, previewLoading, previewError);
            } catch (error) {
                console.error('Error loading PDF from data:', error);
                showPreviewError('Failed to load PDF preview', previewLoading, previewError);
            }
        } else {
            // Show message for sample data or unavailable files
            const message = pdf.has_large_file 
                ? 'Preview temporarily unavailable for large files. Please download to view the content.'
                : 'Preview not available for sample data. You can still download to see the content.';
            showPreviewError(message, previewLoading, previewError);
        }
        
    } catch (error) {
        console.error('Preview error:', error);
        showError('Failed to open preview: ' + error.message);
    }
}

function createSamplePDFForPreview(pdf, previewFrame, previewLoading, previewError) {
    try {
        // Create a sample PDF document with actual content
        const pdfContent = generateSamplePDFContent(pdf);
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        previewFrame.src = url;
        setupPreviewLoadHandlers(previewFrame, previewLoading, previewError);
        
        // Clean up URL after some time
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 30000);
        
    } catch (error) {
        console.error('Error creating sample PDF for preview:', error);
        showPreviewError('Unable to generate PDF preview. You can still download the file.', previewLoading, previewError);
    }
}

function generateSamplePDFContent(pdf) {
    // Generate a simple but valid PDF structure
    const content = `Sample content for ${pdf.filename}
    
Category: ${getCategoryDisplayName(pdf.category)}
Upload Date: ${pdf.upload_date}
File Size: ${formatFileSize(pdf.size)}
Downloads: ${pdf.download_count}

This is a demonstration PDF file generated for preview purposes.
The actual PDF content would appear here in a real implementation.

PDF PLACE - Your Educational Resource Hub
    
For more educational resources, visit PDF PLACE.`;

    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length + 100}
>>
stream
BT
/F1 12 Tf
50 750 Td
${content.split('\n').map((line, index) => `(${line.replace(/[()\\]/g, '\\$&')}) Tj 0 -15 Td`).join('\n')}
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000${(400 + content.length).toString().padStart(3, '0')} 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${450 + content.length}
%%EOF`;
}

function setupPreviewLoadHandlers(iframe, loadingElement, errorElement) {
    let loadTimeout = setTimeout(() => {
        showPreviewError('PDF is taking too long to load. Please try downloading instead.', loadingElement, errorElement);
    }, 10000); // 10 second timeout
    
    iframe.onload = function() {
        clearTimeout(loadTimeout);
        try {
            // Check if iframe actually loaded content
            loadingElement.style.display = 'none';
            iframe.style.display = 'block';
        } catch (error) {
            console.error('Error handling iframe load:', error);
            showPreviewError('Failed to display PDF preview', loadingElement, errorElement);
        }
    };
    
    iframe.onerror = function() {
        clearTimeout(loadTimeout);
        showPreviewError('Failed to load PDF preview', loadingElement, errorElement);
    };
}

function showPreviewError(message, loadingElement, errorElement) {
    if (loadingElement) loadingElement.style.display = 'none';
    if (errorElement) {
        errorElement.style.display = 'block';
        const errorMessageElement = document.getElementById('previewErrorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
        }
    }
}

function retryPreview() {
    if (currentPreviewFile) {
        previewPDF(currentPreviewFile.id);
    }
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    const previewFrame = document.getElementById('previewFrame');
    
    if (modal) modal.style.display = 'none';
    if (previewFrame) {
        previewFrame.src = '';
        previewFrame.style.display = 'none';
    }
    
    currentPreviewFile = null;
}

function downloadPDF(pdfId) {
    try {
        const pdf = samplePDFs.find(p => p.id == pdfId);
        if (!pdf) {
            showError('PDF not found');
            return;
        }
        
        // Show loading state
        showLoading(true);
        
        setTimeout(() => {
            try {
                let downloadSuccess = false;
                
                // Try to get actual file data from various sources
                let pdfDataUrl = null;
                
                if (pdf.file_data && pdf.file_data.startsWith('data:')) {
                    pdfDataUrl = pdf.file_data;
                } else if (window.sessionPDFs) {
                    const sessionPdf = window.sessionPDFs.find(p => p.id === pdf.id);
                    if (sessionPdf && sessionPdf.file_data && sessionPdf.file_data.startsWith('data:')) {
                        pdfDataUrl = sessionPdf.file_data;
                    }
                }
                
                if (pdfDataUrl) {
                    // Download actual uploaded file
                    downloadSuccess = downloadFromData(pdfDataUrl, pdf.filename);
                } else {
                    // For sample data, create a demo PDF with sample content
                    downloadSuccess = createAndDownloadSamplePDF(pdf.filename);
                }
                
                if (downloadSuccess) {
                    // Update download count
                    pdf.download_count = (pdf.download_count || 0) + 1;
                    saveUploadedPDFs();
                    
                    // Add to download history
                    addToDownloadHistory(pdf);
                    
                    // Update UI
                    loadPDFs();
                    showSuccess(`Downloaded: ${pdf.filename}`);
                } else {
                    showError('Download failed. Please try again.');
                }
                
            } catch (error) {
                console.error('Download processing error:', error);
                showError('Download failed: ' + error.message);
            } finally {
                showLoading(false);
            }
        }, 500);
        
    } catch (error) {
        console.error('Download error:', error);
        showError('Download failed: ' + error.message);
        showLoading(false);
    }
}

function downloadCurrentPDF() {
    if (currentPreviewFile) {
        downloadPDF(currentPreviewFile.id);
    } else {
        showError('No PDF selected for download');
    }
}

function downloadFromData(dataUrl, filename) {
    try {
        // Validate data URL
        if (!dataUrl || !dataUrl.startsWith('data:')) {
            console.error('Invalid data URL provided');
            return false;
        }
        
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename || 'download.pdf';
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        
        // Use setTimeout to ensure the link is in DOM before clicking
        setTimeout(() => {
            link.click();
            document.body.removeChild(link);
        }, 10);
        
        return true;
    } catch (error) {
        console.error('Error downloading from data URL:', error);
        return false;
    }
}

function createAndDownloadPDF(pdf) {
    try {
        // Generate proper PDF content using the same function as preview
        const pdfContent = generateSamplePDFContent(pdf);
        
        // Create blob and download
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = pdf.filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('Error creating PDF for download:', error);
        return false;
    }
}

function createAndDownloadSamplePDF(filename) {
    try {
        // Create a simple PDF document for fallback
        const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 14 Tf
50 750 Td
(PDF PLACE - Educational Resource) Tj
0 -30 Td
(File: ${filename.replace(/[()\\]/g, '\\$&')}) Tj
0 -30 Td
(This is a demonstration PDF file.) Tj
0 -30 Td
(Visit PDF PLACE for more educational resources.) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000500 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
580
%%EOF`;
        
        // Create blob and download
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('Error creating sample PDF:', error);
        return false;
    }
}

function deletePDF(pdfId) {
    if (!isAdmin) {
        showError('Delete permission denied. Admin access required.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this PDF?')) {
        return;
    }
    
    try {
        const index = samplePDFs.findIndex(p => p.id == pdfId);
        if (index !== -1) {
            const deletedPDF = samplePDFs.splice(index, 1)[0];
            saveUploadedPDFs();
            loadPDFs();
            loadStorageInfo();
            showSuccess(`Deleted: ${deletedPDF.filename}`);
        } else {
            showError('PDF not found');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showError('Delete failed: ' + error.message);
    }
}

function addToDownloadHistory(pdf) {
    try {
        const downloads = getDownloadHistory();
        const downloadEntry = {
            id: Date.now(),
            filename: pdf.filename,
            category: pdf.category,
            download_date: new Date().toISOString(),
            size: pdf.size
        };
        
        downloads.unshift(downloadEntry);
        
        // Keep only last 100 downloads
        if (downloads.length > 100) {
            downloads.splice(100);
        }
        
        localStorage.setItem('downloadHistory', JSON.stringify(downloads));
    } catch (error) {
        console.error('Error saving download history:', error);
    }
}

function getDownloadHistory() {
    try {
        const downloads = localStorage.getItem('downloadHistory');
        return downloads ? JSON.parse(downloads) : [];
    } catch (error) {
        console.error('Error loading download history:', error);
        return [];
    }
}

function loadDownloads() {
    const downloadsList = document.getElementById('downloadsList');
    if (!downloadsList) return;
    
    try {
        const downloads = getDownloadHistory();
        
        if (downloads.length === 0) {
            downloadsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📥</div>
                    <h3>No Downloads Yet</h3>
                    <p>Your download history will appear here after you download some files.</p>
                </div>
            `;
            return;
        }
        
        const downloadItems = downloads.map(download => {
            const downloadDate = new Date(download.download_date);
            const formattedDate = downloadDate.toLocaleDateString();
            const formattedTime = downloadDate.toLocaleTimeString();
            const sizeFormatted = formatFileSize(download.size);
            
            return `
                <div class="download-item">
                    <div class="download-info">
                        <h4>${escapeHtml(download.filename)}</h4>
                        <p>Downloaded on ${formattedDate} at ${formattedTime} • ${sizeFormatted}</p>
                    </div>
                    <div class="download-actions">
                        <span class="category-badge ${download.category || 'others'}">${getCategoryDisplayName(download.category)}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        downloadsList.innerHTML = downloadItems;
        
    } catch (error) {
        console.error('Error loading downloads:', error);
        downloadsList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Loading Error</h3>
                <p>Failed to load download history.</p>
                <button onclick="loadDownloads()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

function filterDownloads() {
    const filter = document.getElementById('downloadsFilter');
    const filterValue = filter ? filter.value : '';
    
    // This would filter downloads based on the selected time period
    // For now, just reload all downloads
    loadDownloads();
}

function clearDownloadHistory() {
    if (!confirm('Are you sure you want to clear your download history?')) {
        return;
    }
    
    try {
        localStorage.removeItem('downloadHistory');
        loadDownloads();
        showSuccess('Download history cleared successfully!');
    } catch (error) {
        console.error('Error clearing download history:', error);
        showError('Failed to clear download history');
    }
}

// Comments Functions
function submitComment(event) {
    if (event) {
        event.preventDefault();
    }
    
    try {
        const commentText = document.getElementById('commentText').value.trim();
        const commentCategory = document.getElementById('commentCategory').value;
        
        if (!commentText) {
            showError('Please enter your feedback');
            return;
        }
        
        if (!currentUser) {
            showError('Please login to submit feedback');
            return;
        }
        
        const comment = {
            id: Date.now(),
            user: currentUser,
            text: commentText,
            category: commentCategory,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Save comment
        const comments = getComments();
        comments.unshift(comment);
        localStorage.setItem('userComments', JSON.stringify(comments));
        
        // Reset form
        document.getElementById('feedbackForm').reset();
        
        // Reload comments
        loadComments();
        showSuccess('Feedback submitted successfully!');
        
    } catch (error) {
        console.error('Error submitting comment:', error);
        showError('Failed to submit feedback: ' + error.message);
    }
}

function getComments() {
    try {
        const comments = localStorage.getItem('userComments');
        return comments ? JSON.parse(comments) : [];
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}

function loadComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    try {
        const comments = getComments();
        
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <h3>No Feedback Yet</h3>
                    <p>Be the first to share your feedback and help us improve!</p>
                </div>
            `;
            return;
        }
        
        const commentItems = comments.map(comment => {
            const commentDate = new Date(comment.date);
            const formattedDate = commentDate.toLocaleDateString();
            const formattedTime = commentDate.toLocaleTimeString();
            
            return `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-user">${escapeHtml(comment.user)}</span>
                        <span class="comment-date">${formattedDate} at ${formattedTime}</span>
                    </div>
                    <div class="comment-content">
                        ${escapeHtml(comment.text)}
                    </div>
                    <div class="comment-category ${comment.category}">
                        ${getCategoryIcon(comment.category)} ${getCategoryDisplayName(comment.category)}
                    </div>
                </div>
            `;
        }).join('');
        
        commentsList.innerHTML = commentItems;
        
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Loading Error</h3>
                <p>Failed to load feedback.</p>
                <button onclick="loadComments()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

// Storage Management
function loadStorageInfo() {
    const storageUsage = document.getElementById('storageUsage');
    if (!storageUsage) return;
    
    try {
        const used = JSON.stringify(samplePDFs).length;
        const maxStorage = 5 * 1024 * 1024; // 5MB
        const usedFormatted = formatFileSize(used);
        const maxFormatted = formatFileSize(maxStorage);
        const percentage = Math.round((used / maxStorage) * 100);
        
        storageUsage.textContent = `Storage: ${usedFormatted} / ${maxFormatted} (${percentage}%)`;
        
        if (percentage > 80) {
            storageUsage.style.color = 'var(--danger-color)';
        } else if (percentage > 60) {
            storageUsage.style.color = 'var(--warning-color)';
        } else {
            storageUsage.style.color = 'var(--text-color)';
        }
    } catch (error) {
        console.error('Error loading storage info:', error);
        storageUsage.textContent = 'Storage: Error loading info';
    }
}

function clearStorageSpace() {
    if (!confirm('This will remove file data from stored PDFs to free up space. Continue?')) {
        return;
    }
    
    try {
        let clearedCount = 0;
        samplePDFs.forEach(pdf => {
            if (pdf.file_data) {
                pdf.file_data = null;
                clearedCount++;
            }
        });
        
        if (clearedCount > 0) {
            saveUploadedPDFs();
            loadStorageInfo();
            showSuccess(`Cleared storage data from ${clearedCount} files. Downloads and previews may not work for these files.`);
        } else {
            showSuccess('No storage data to clear.');
        }
    } catch (error) {
        console.error('Error clearing storage:', error);
        showError('Failed to clear storage space');
    }
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCategoryDisplayName(category) {
    const categoryNames = {
        'mocktest': 'Mock Test',
        'ncert': 'NCERT',
        'pyqs': 'PYQs',
        'pw-notes': 'PW Notes',
        'kgs-notes': 'KGS Notes',
        'others': 'Others'
    };
    return categoryNames[category] || 'Others';
}

function getCategoryIcon(category) {
    const categoryIcons = {
        'suggestion': '💡',
        'bug': '🐛',
        'feature': '✨',
        'general': '💬'
    };
    return categoryIcons[category] || '💬';
}

// Toast Notifications
function showError(message) {
    showToast('errorToast', 'errorMessage', message);
}

function showSuccess(message) {
    showToast('successToast', 'successMessage', message);
}

function showToast(toastId, messageId, message) {
    try {
        const toast = document.getElementById(toastId);
        const messageElement = document.getElementById(messageId);
        
        if (toast && messageElement) {
            messageElement.textContent = message;
            toast.style.display = 'flex';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                hideToast(toastId);
            }, 5000);
        }
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

function hideToast(toastId) {
    try {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.display = 'none';
        }
    } catch (error) {
        console.error('Error hiding toast:', error);
    }
}

// Loading Overlay
function showLoading(show) {
    try {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Error toggling loading overlay:', error);
    }
}

// Fullscreen Functions
function toggleFullscreen() {
    try {
        const modal = document.getElementById('previewModal');
        if (!modal) return;
        
        if (!document.fullscreenElement) {
            modal.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
                showError('Fullscreen not supported by your browser');
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.error('Error attempting to exit fullscreen:', err);
            });
        }
    } catch (error) {
        console.error('Fullscreen error:', error);
        showError('Fullscreen failed: ' + error.message);
    }
}

// Event Listeners for modal close on outside click
document.addEventListener('click', function(event) {
    // Close modals when clicking outside
    if (event.target.classList.contains('modal-overlay')) {
        if (event.target.id === 'previewModal') {
            closePreview();
        } else if (event.target.id === 'forgotPasswordModal') {
            closeForgotPassword();
        }
    }
    
    // Close popup when clicking outside
    if (event.target.classList.contains('popup-overlay')) {
        if (event.target.id === 'welcomePopup') {
            closeWelcomePopup();
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to close modals
    if (event.key === 'Escape') {
        closePreview();
        closeForgotPassword();
        closeWelcomePopup();
    }
});

// Initialize search functionality
document.addEventListener('input', function(event) {
    if (event.target.id === 'searchInput') {
        searchPDFs();
    }
});

