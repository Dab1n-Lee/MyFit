document.addEventListener('DOMContentLoaded', () => {
    const dropAreaMain = document.getElementById('drop-area');
    const fileUploadMain = document.getElementById('file-upload');

    ['dragenter', 'dragover'].forEach(eventName => {
        dropAreaMain.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
            dropAreaMain.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropAreaMain.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
            dropAreaMain.classList.remove('dragover');
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

    function handleMainFiles(files) {
        const file = files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('preview');
                preview.src = e.target.result;
            };
            reader.readAsDataURL(file);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('File uploaded successfully:', data);
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        }
    }
});
