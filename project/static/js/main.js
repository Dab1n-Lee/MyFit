document.addEventListener('DOMContentLoaded', () => {
    const dropAreaMain = document.getElementById('drop-area');
    const fileUploadMain = document.getElementById('file-upload');
    const preview = document.getElementById('preview');
    const cancelButton = document.getElementById('cancel-button');
    const modelButton = document.getElementById('modeling-button');
    const uploadButton = document.getElementById('upload-button');

    const resetDropArea = () => {
        preview.style.display = 'none';
        cancelButton.style.display = 'none';
        modelButton.style.display = 'none';
        uploadButton.style.display = 'block';
        dropAreaMain.classList.remove('dragover');
        dropAreaMain.style.border = 'none';  // Resetting border style
        fileUploadMain.value = '';  // Clear the file input
    };

    ['dragenter', 'dragover'].forEach(eventName => {
        dropAreaMain.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
            dropAreaMain.classList.add('dragover');
            dropAreaMain.style.border = '2px solid #000';  // Change border style on drag
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropAreaMain.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
            dropAreaMain.classList.remove('dragover');
            dropAreaMain.style.border = 'none';  // Reset border style on drag leave or drop
        }, false);
    });

    dropAreaMain.addEventListener('drop', (event) => {
        const files = event.dataTransfer.files;
        handleMainFiles(files);
    });

    fileUploadMain.addEventListener('change', function(event) {
        const files = event.target.files;
        handleMainFiles(files);
    });

    cancelButton.addEventListener('click', resetDropArea);

    modelButton.addEventListener('click', () => {
        const file = fileUploadMain.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/model', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('File modeled successfully:', data);
            })
            .catch(error => {
                console.error('Error modeling file:', error);
            });
        }
    });

    function handleMainFiles(files) {
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
                cancelButton.style.display = 'block';
                modelButton.style.display = 'block';
                uploadButton.style.display = 'none';
                dropAreaMain.style.border = 'none';  // Hide border when showing preview
            };
            reader.readAsDataURL(file);
        }
    }
});
