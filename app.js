// Supabase configuration - Replace with your own config
const SUPABASE_URL = 'https://tihbbfqofgzpgikqrlfj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaGJiZnFvZmd6cGdpa3FybGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODk1MDIsImV4cCI6MjA3MTE2NTUwMn0.BAy9GqjHOvxgddbOcZ-U351QM8o_ZyZaUZo60dU5mBs';
const STORAGE_BUCKET = 'photos'; // Your storage bucket name

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const captureBtn = document.getElementById('captureBtn');
const fileInput = document.getElementById('fileInput');
const uploadStatus = document.getElementById('uploadStatus');
const gallery = document.getElementById('gallery');

// Recent uploads (stored in memory for this session)
let recentUploads = [];

// Handle capture button click
captureBtn.addEventListener('click', () => {
    fileInput.click();
});

// Handle file selection
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        handleImageCapture(file);
    }
});

// Handle image capture and upload
async function handleImageCapture(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Show upload status
    uploadStatus.style.display = 'flex';
    captureBtn.disabled = true;

    try {
        // Create a unique filename
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;
        
        // Upload the file to Supabase Storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file);
        
        if (error) {
            throw error;
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath);
        
        if (!urlData || !urlData.publicUrl) {
            throw new Error('Failed to get public URL');
        }
        
        // Add to recent uploads
        const uploadData = {
            url: urlData.publicUrl,
            timestamp: timestamp,
            name: fileName,
            path: filePath
        };
        
        recentUploads.unshift(uploadData);
        
        // Keep only the last 20 uploads
        if (recentUploads.length > 20) {
            recentUploads = recentUploads.slice(0, 20);
        }
        
        // Update gallery
        updateGallery();
        
        // Hide upload status
        uploadStatus.style.display = 'none';
        captureBtn.disabled = false;
        
        // Reset file input
        fileInput.value = '';
        
    } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Upload failed: ${error.message}`);
        uploadStatus.style.display = 'none';
        captureBtn.disabled = false;
    }
}

// Update gallery display
function updateGallery() {
    if (recentUploads.length === 0) {
        gallery.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>No photos yet. Capture your first photo!</p>
            </div>
        `;
        return;
    }

    gallery.innerHTML = recentUploads.map(upload => {
        const date = new Date(upload.timestamp);
        const formattedDate = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="gallery-item" onclick="viewImage('${upload.url}')">
                <img src="${upload.url}" alt="${upload.name}" loading="lazy">
                <div class="timestamp">${formattedDate}</div>
            </div>
        `;
    }).join('');
}

// View full-size image
function viewImage(url) {
    window.open(url, '_blank');
}

// Load existing images from Supabase Storage
async function loadExistingImages() {
    try {
        // List files from the uploads folder
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list('uploads', {
                limit: 20,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });
        
        if (error) {
            console.error('Error listing files:', error);
            updateGallery();
            return;
        }
        
        if (data && data.length > 0) {
            // Convert file list to upload format
            recentUploads = data.map(file => {
                const { data: urlData } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(`uploads/${file.name}`);
                
                return {
                    url: urlData.publicUrl,
                    timestamp: new Date(file.created_at).getTime(),
                    name: file.name,
                    path: `uploads/${file.name}`
                };
            });
        }
        
        updateGallery();
    } catch (error) {
        console.error('Error loading images:', error);
        updateGallery();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check if Supabase is configured
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        gallery.innerHTML = `
            <div class="empty-state">
                <p>Please configure Supabase credentials in app.js</p>
            </div>
        `;
        captureBtn.disabled = true;
        return;
    }
    
    loadExistingImages();
});