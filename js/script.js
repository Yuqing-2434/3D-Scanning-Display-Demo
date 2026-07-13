// Function to fetch data.json and populate the HTML
async function initializeWebsite() {
    try {
        // Fetch the configuration JSON file
        const response = await fetch('js/data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // 1. Setup Page Title and Description
        document.getElementById('page-title').textContent = data.title;
        document.getElementById('page-description').textContent = data.description;
        document.title = "3D Specimen: " + data.title;

        // 2. Setup Header Banner Background
        if (data.bannerUrl) {
            document.querySelector('.banner').style.backgroundImage = `url('${data.bannerUrl}')`;
        }

        // 3. Setup 3D Model Viewer
        const modelViewer = document.getElementById('model-viewer');
        if (data.modelUrl) {
            modelViewer.src = data.modelUrl;
        }

        // 4. Generate Image Gallery (6 faces of the item)
        const galleryGrid = document.getElementById('gallery-grid');
        
        data.images.forEach(imgData => {
            // Create container for gallery item
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            // Create image element
            const img = document.createElement('img');
            img.src = imgData.src;
            img.alt = imgData.label;
            img.loading = "lazy";
            
            // Create label element
            const label = document.createElement('div');
            label.className = 'gallery-label';
            label.textContent = imgData.label;

            // Append elements
            item.appendChild(img);
            item.appendChild(label);
            
            // Add click listener to open the modal preview
            item.addEventListener('click', () => openImageModal(imgData.src, imgData.label));

            galleryGrid.appendChild(item);
        });

    } catch (error) {
        console.error("Failed to load or parse data.json:", error);
        document.getElementById('page-description').textContent = "Error: Failed to load configuration data. Check console for details.";
    }
}

// === Modal Logic for Fullscreen Image Viewing ===

const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-img");
const captionText = document.getElementById("modal-caption");
const closeBtn = document.getElementById("close-modal");

// Opens the modal with the specified image source and caption
function openImageModal(src, caption) {
    modal.style.display = "block";
    modalImg.src = src;
    captionText.textContent = caption;
}

// Close the modal when the 'X' button is clicked
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// Close the modal when clicking outside of the image
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape" && modal.style.display === "block") {
        modal.style.display = "none";
    }
});

// Skybox Toggle Logic
const toggleSkyboxBtn = document.getElementById('toggle-skybox-btn');
const modelWrapper = document.getElementById('model-wrapper');

if (toggleSkyboxBtn && modelWrapper) {
    toggleSkyboxBtn.addEventListener('click', () => {
        modelWrapper.classList.toggle('with-skybox');
    });
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeWebsite);
