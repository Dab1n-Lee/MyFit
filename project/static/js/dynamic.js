document.addEventListener('DOMContentLoaded', () => {
    const mybody = document.querySelector('.mybody');
    const mycloset = document.querySelector('.mycloset');
    const main = document.querySelector('.main');

    let isBoxOpen = false;
    let currentOverlay = null;
    let selectedImageId = null;

    // Temporary storage for body info
    let bodyInfo = {
        height: { value: '', unit: 'cm' },
        weight: { value: '', unit: 'kg' },
        waist: { value: '', unit: 'cm' }
    };

    // Temporary storage for details info
    let detailsInfo = {
        length: { value: '', unit: 'cm' },
        waist: { value: '', unit: 'cm' }
    };

    const dynamicLink = document.createElement('link');
    dynamicLink.rel = 'stylesheet';
    dynamicLink.href = dynamicCssUrl;
    document.head.appendChild(dynamicLink);

    const detailsLink = document.createElement('link');
    detailsLink.rel = 'stylesheet';
    detailsLink.href = detailCssUrl;
    document.head.appendChild(detailsLink);

    function createOverlay(content, overlayClass) {
        if (isBoxOpen && currentOverlay) {
            currentOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = overlayClass || 'overlay';
        overlay.innerHTML = content;

        main.appendChild(overlay);

        isBoxOpen = true;
        currentOverlay = overlay;

        overlay.querySelector('.close-button').addEventListener('click', () => {
            closeOverlay();
        });

        function handleEscKey(event) {
            if (event.key === 'Escape' && isBoxOpen) {
                closeOverlay();
            }
        }
        document.addEventListener('keydown', handleEscKey);

        function closeOverlay() {
            if (currentOverlay) {
                currentOverlay.remove();
                isBoxOpen = false;
                currentOverlay = null;
                document.removeEventListener('keydown', handleEscKey);
            }
        }
    }

    function createDetailsBox() {
        const detailsContent = `
            <div class="details-box">
                <button class="back-button">&lt;</button>
                <h2>Details</h2>
                <div class="details-form">
                    <div class="form-group">
                        <label for="length">Length</label>
                        <input type="text" id="length" name="length" value="${detailsInfo.length.value}">
                        <select id="length-unit" name="length-unit">
                            <option value="cm" ${detailsInfo.length.unit === 'cm' ? 'selected' : ''}>cm</option>
                            <option value="inch" ${detailsInfo.length.unit === 'inch' ? 'selected' : ''}>inch</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="waist-details">Waist</label>
                        <input type="text" id="waist-details" name="waist-details" value="${detailsInfo.waist.value}">
                        <select id="waist-details-unit" name="waist-details-unit">
                            <option value="cm" ${detailsInfo.waist.unit === 'cm' ? 'selected' : ''}>cm</option>
                            <option value="inch" ${detailsInfo.waist.unit === 'inch' ? 'selected' : ''}>inch</option>
                        </select>
                    </div>
                    <button class="save-button">Save</button>
                </div>
            </div>
        `;

        const detailsOverlay = document.createElement('div');
        detailsOverlay.className = 'details-overlay';
        detailsOverlay.innerHTML = detailsContent;

        document.querySelector('.dynamic-box').appendChild(detailsOverlay);

        detailsOverlay.querySelector('.back-button').addEventListener('click', () => {
            detailsOverlay.remove();
        });

        detailsOverlay.querySelector('.save-button').addEventListener('click', () => {
            detailsInfo = {
                length: { value: document.getElementById('length').value, unit: document.getElementById('length-unit').value },
                waist: { value: document.getElementById('waist-details').value, unit: document.getElementById('waist-details-unit').value }
            };

            // Send the updated details info to the server
            fetch('/save-details-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(detailsInfo)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Details info saved successfully:', data);
                showSavedMessageInOverlay(); // Show the saved message within the overlay
                detailsOverlay.remove();
            })
            .catch(error => {
                console.error('Error saving details info:', error);
            });
        });
    }

    function createUploadBox() {
        createOverlay(`
            <div class="dynamic-box">
                <button class="close-button">&times;</button>
                <h2>Upload your pants!</h2>
                <div class="upload-box" id="drop-area-dynamic-box">
                    <img src="${uploadImgUrl}" alt="Upload Icon">
                    <p>Drag & Drop or select from your device.</p>
                    <button type="button" class="upload-button">Choose File</button>
                    <input type="file" id="file-upload-dynamic" accept="image/*" style="display: none;">
                </div>
                <button class="details-button">Details</button>
                <p class="upload-details">For more accurate modeling</p>
                <h3>Select your pants!</h3>
                <div class="image-gallery" id="image-gallery"></div>
                <button id="select-image-button" class="select-image-button" disabled>Fitting!</button>
            </div>
        `);

        const fileUploadDynamic = document.getElementById('file-upload-dynamic');
        const dropAreaDynamic = document.getElementById('drop-area-dynamic-box');
        const selectImageButton = document.getElementById('select-image-button');
        const imageGallery = document.getElementById('image-gallery');

        fileUploadDynamic.addEventListener('change', function(event) {
            const files = event.target.files;
            handleDynamicFiles(files);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropAreaDynamic.addEventListener(eventName, (event) => {
                event.preventDefault();
                event.stopPropagation();
                dropAreaDynamic.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropAreaDynamic.addEventListener(eventName, (event) => {
                event.preventDefault();
                event.stopPropagation();
                dropAreaDynamic.classList.remove('dragover');
            }, false);
        });

        dropAreaDynamic.addEventListener('drop', (event) => {
            const files = event.dataTransfer.files;
            handleDynamicFiles(files);
        });

        document.querySelector('.details-button').addEventListener('click', () => {
            createDetailsBox();
        });

        document.querySelector('.upload-button').addEventListener('click', () => {
            fileUploadDynamic.click();
        });

        imageGallery.addEventListener('click', (event) => {
            if (event.target.tagName === 'IMG') {
                const clickedImage = event.target;
                const isSelected = clickedImage.classList.contains('selected');

                // Deselect all images if one is selected
                imageGallery.querySelectorAll('img').forEach(img => {
                    img.classList.remove('selected');
                    img.classList.remove('with-check');
                    img.dataset.selected = 'false';
                });

                if (!isSelected) {
                    clickedImage.classList.add('selected');
                    clickedImage.classList.add('with-check');
                    clickedImage.dataset.selected = 'true';
                    selectedImageId = clickedImage.dataset.id;
                    selectImageButton.classList.add('enabled');
                    selectImageButton.disabled = false;
                } else {
                    selectedImageId = null;
                    selectImageButton.classList.remove('enabled');
                    selectImageButton.disabled = true;
                }
            }
        });

        selectImageButton.addEventListener('click', () => {
            if (selectedImageId) {
                // Sending the selected image ID to the server
                fetch('/process-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ imageId: selectedImageId })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Image processing successful:', data);
                })
                .catch(error => {
                    console.error('Error processing image:', error);
                });
            } else {
                console.warn('No image selected');
            }
        });
    }

    function handleDynamicFiles(files) {
        const file = files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            const reader = new FileReader();
            reader.onload = function(e) {
                const gallery = document.getElementById('image-gallery');
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Uploaded Image';
                img.classList.add('gallery-image');
                img.dataset.id = Date.now(); // Assign a unique ID
                gallery.appendChild(img);
            };
            reader.readAsDataURL(file);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('File uploaded successfully:', data);
                const gallery = document.getElementById('image-gallery');
                const img = document.createElement('img');
                img.src = data.file.url;
                img.alt = 'Uploaded Image';
                img.dataset.id = data.file.id; // Use ID from server
                img.classList.add('gallery-image');
                gallery.appendChild(img);
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        }
    }

    function showSavedMessageInOverlay() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'saved-message';
        messageDiv.innerText = 'Saved!';
        currentOverlay.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 2000);
    }

    mybody.addEventListener('click', () => {
        createOverlay(`
            <div class="dynamic-box">
                <button class="close-button">&times;</button>
                <h1 class="title">Body Info</h1>
                <h2 class="sub-title">Edit and save your changed body measurement.</h2>
                    <div class="form-group">
                        <label for="height">Height</label>
                        <input type="text" id="height" name="height" value="${bodyInfo.height.value}">
                        <select id="height-unit" name="height-unit">
                            <option value="cm" ${bodyInfo.height.unit === 'cm' ? 'selected' : ''}>cm</option>
                            <option value="inch" ${bodyInfo.height.unit === 'inch' ? 'selected' : ''}>inch</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="weight">Weight</label>
                        <input type="text" id="weight" name="weight" value="${bodyInfo.weight.value}">
                        <select id="weight-unit" name="weight-unit">
                            <option value="kg" ${bodyInfo.weight.unit === 'kg' ? 'selected' : ''}>kg</option>
                            <option value="lbs" ${bodyInfo.weight.unit === 'lbs' ? 'selected' : ''}>lbs</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="waist">Waist</label>
                        <input type="text" id="waist" name="waist" value="${bodyInfo.waist.value}">
                        <select id="waist-unit" name="waist-unit">
                            <option value="cm" ${bodyInfo.waist.unit === 'cm' ? 'selected' : ''}>cm</option>
                            <option value="inch" ${bodyInfo.waist.unit === 'inch' ? 'selected' : ''}>inch</option>
                        </select>
                    </div>
                    <button class="submit-button">Save</button>
                </div>
            </div>
        `);

        document.querySelector('.save-button').addEventListener('click', () => {
            bodyInfo = {
                height: { value: document.getElementById('height').value, unit: document.getElementById('height-unit').value },
                weight: { value: document.getElementById('weight').value, unit: document.getElementById('weight-unit').value },
                waist: { value: document.getElementById('waist').value, unit: document.getElementById('waist-unit').value }
            };

            // Send the updated body info to the server
            fetch('/save-body-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyInfo)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Body info saved successfully:', data);
                showSavedMessageInOverlay(); // Show the saved message within the overlay
            })
            .catch(error => {
                console.error('Error saving body info:', error);
            });
        });
    });

    mycloset.addEventListener('click', () => {
        createUploadBox();
    });
});
