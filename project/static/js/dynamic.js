const dropArea = document.getElementById('drop-area');

        // 드래그 앤 드랍 이벤트
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, (event) => {
                event.preventDefault();
                event.stopPropagation();
                dropArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (event) => {
                event.preventDefault();
                event.stopPropagation();
                dropArea.classList.remove('dragover');
            }, false);
        });

        dropArea.addEventListener('drop', (event) => {
            const files = event.dataTransfer.files;
            handleFiles(files);
        });

        document.getElementById('file-upload').addEventListener('change', function(event) {
            const files = event.target.files;
            handleFiles(files);
        });

        function handleFiles(files) {
            const file = files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                // 이미지 미리보기 표시
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('preview');
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);

                // 파일 서버로 업로드
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