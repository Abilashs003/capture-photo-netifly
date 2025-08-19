// Supabase configuration - Replace with your own config
const SUPABASE_URL = 'https://tihbbfqofgzpgikqrlfj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaGJiZnFvZmd6cGdpa3FybGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODk1MDIsImV4cCI6MjA3MTE2NTUwMn0.BAy9GqjHOvxgddbOcZ-U351QM8o_ZyZaUZo60dU5mBs';
const STORAGE_BUCKET = 'photos'; // Your storage bucket name

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const captureBtn = document.getElementById('captureBtn');
const fileInput = document.getElementById('fileInput');
const newPhotoBtn = document.getElementById('newPhotoBtn');
const previewImage = document.getElementById('previewImage');

// Screens
const captureScreen = document.getElementById('captureScreen');
const uploadScreen = document.getElementById('uploadScreen');
const successScreen = document.getElementById('successScreen');

// Handle capture button click
captureBtn.addEventListener('click', () => {
    fileInput.click();
});

// Handle new photo button click
newPhotoBtn.addEventListener('click', () => {
    resetToCapture();
});

// Handle file selection
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        handleImageCapture(file);
    }
});

// Switch screens with animation
function switchScreen(fromScreen, toScreen) {
    fromScreen.classList.remove('active');
    setTimeout(() => {
        toScreen.classList.add('active');
    }, 400);
}

// Reset to capture screen
function resetToCapture() {
    switchScreen(successScreen, captureScreen);
    fileInput.value = '';
    previewImage.src = '';
}

// Handle image capture and upload
async function handleImageCapture(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Switch to upload screen
    switchScreen(captureScreen, uploadScreen);

    try {
        // Create a unique filename
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;
        
        // Upload the file to Supabase Storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
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
        
        // Set the preview image
        previewImage.src = urlData.publicUrl;
        
        // Wait a bit for the upload animation to complete
        setTimeout(() => {
            switchScreen(uploadScreen, successScreen);
        }, 1500);
        
    } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Upload failed: ${error.message}`);
        switchScreen(uploadScreen, captureScreen);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check if Supabase is configured
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        captureBtn.disabled = true;
        captureBtn.innerHTML = '<span>Please configure Supabase</span>';
        return;
    }
    
    // Ensure capture screen is active on load
    captureScreen.classList.add('active');
});

// Prevent default drag and drop behavior
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});