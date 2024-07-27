document.addEventListener("DOMContentLoaded", () => {
  const mybody = document.querySelector(".mybody");
  const mycloset = document.querySelector(".mycloset");
  const main = document.querySelector(".main");

  let isBoxOpen = false; // 동적 박스가 열려 있는지 여부를 추적
  let currentOverlay = null; // 현재 열려 있는 오버레이를 추적
  let selectedImageId = null; // 선택된 이미지의 ID를 추적

  // CSS 파일 참조 추가
  const dynamicLink = document.createElement("link");
  dynamicLink.rel = "stylesheet";
  dynamicLink.href = dynamicCssUrl;
  document.head.appendChild(dynamicLink);

  const detailsLink = document.createElement("link");
  detailsLink.rel = "stylesheet";
  detailsLink.href = detailCssUrl;
  document.head.appendChild(detailsLink);

  // Create overlay function
  function createOverlay(content, overlayClass) {
    if (isBoxOpen && currentOverlay) {
      currentOverlay.remove(); // 기존 박스 닫기
    }

    const overlay = document.createElement("div");
    overlay.className = overlayClass || "overlay";
    overlay.innerHTML = content;

    // Append the overlay to main
    main.appendChild(overlay);

    // Set the flag to indicate that a box is open
    isBoxOpen = true;
    currentOverlay = overlay;

    // Close button event listener
    overlay.querySelector(".close-button").addEventListener("click", () => {
      closeOverlay();
    });

    function handleEscKey(event) {
      if (event.key === "Escape" && isBoxOpen) {
        closeOverlay();
      }
    }
    document.addEventListener("keydown", handleEscKey);

    function closeOverlay() {
      if (currentOverlay) {
        currentOverlay.remove();
        isBoxOpen = false; // Reset the flag when the box is closed
        currentOverlay = null;
        document.removeEventListener("keydown", handleEscKey);
      }
    }
  }

  // Create details box function
  function createDetailsBox() {
    const detailsContent = `
            <div class="details-box">
                <button class="back-button">&lt;</button>
                <h2>Details</h2>
                <div class="details-form">
                    <div class="form-group">
                        <label for="length">Length</label>
                        <input type="text" id="length" name="length">
                        <select id="length-unit" name="length-unit">
                            <option value="cm">cm</option>
                            <option value="inch">inch</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="waist-details">Waist</label>
                        <input type="text" id="waist-details" name="waist-details">
                        <select id="waist-details-unit" name="waist-details-unit">
                            <option value="cm">cm</option>
                            <option value="inch">inch</option>
                        </select>
                    </div>
                    <button class="save-button">Save</button>
                </div>
            </div>
        `;

    const detailsOverlay = document.createElement("div");
    detailsOverlay.className = "details-overlay";
    detailsOverlay.innerHTML = detailsContent;

    // Append the details overlay to the current overlay (upload-box)
    document.querySelector(".dynamic-box").appendChild(detailsOverlay);

    // Handle back button click
    detailsOverlay
      .querySelector(".back-button")
      .addEventListener("click", () => {
        detailsOverlay.remove();
      });

    // Handle save button click
    detailsOverlay
      .querySelector(".save-button")
      .addEventListener("click", () => {
        // Handle save functionality here
        detailsOverlay.remove();
      });
  }

  // Function to handle file upload
  async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/upload", {
        // 서버의 업로드 엔드포인트
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        displayUploadResult(result); // 서버에서 받아온 결과 표시
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Function to display upload result
  function displayUploadResult(result) {
    const uploadBox = document.querySelector(".upload-box");
    const resultDiv = document.createElement("div");
    resultDiv.className = "upload-result";

    if (result.images && result.images.length > 0) {
      const gallery = document.createElement("div");
      gallery.className = "image-gallery";
      result.images.forEach((image) => {
        const img = document.createElement("img");
        img.src = image.url;
        img.alt = "Uploaded Image";
        img.className = "upload-image"; // 추가된 클래스
        gallery.appendChild(img);
      });
      resultDiv.innerHTML = `
                <h3>Upload Result</h3>
                <p>${result.message}</p>
            `;
      resultDiv.appendChild(gallery);
    } else {
      resultDiv.innerHTML = `
                <h3>Your closet is empty!</h3>
            `;
    }

    uploadBox.appendChild(resultDiv);
  }

  // Create dynamic box with upload and select options
  function createUploadBox() {
    createOverlay(`
            <div class="dynamic-box">
                <button class="close-button">&times;</button>
                <h2>Upload your pants!</h2>
                <div class="upload-box">
                    <img src="${uploadImgUrl}" alt="Upload Icon">
                    <p>Drag & Drop or select from your device.</p>
                    <label for="file-upload" class="upload-label">Choose File</label>
                    <input type="file" id="file-upload" accept="image/*">
                </div>
                <button class="upload-button" disabled>Details</button>
                <p class="upload-details">For more accurate modeling</p>
                <h3>Select your pants!</h3>
                <div class="image-gallery" id="image-gallery">
                    <!-- Dynamic images will be loaded here -->
                    <!-- Initial placeholders -->
                    <img src="https://via.placeholder.com/150" alt="Sample Image">
                    <img src="https://via.placeholder.com/150" alt="Sample Image">
                    <img src="https://via.placeholder.com/150" alt="Sample Image">
                    <img src="https://via.placeholder.com/150" alt="Sample Image">
                    <img src="https://via.placeholder.com/150" alt="Sample Image">
                    <img src="https://via.placeholder.com/150" alt="Sample Image">
                    <img src="https://via.placeholder.com/150" alt="Sample Image">
                </div>
                <button id="select-image-button" disabled>Select Image</button>
            </div>
        `);

    // Handle file input change
    document
      .querySelector("#file-upload")
      .addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          handleFileUpload(file);
        }
      });

    // Fetch and display images from server
    fetchImages();

    // Button to open details box
    document.querySelector(".upload-button").addEventListener("click", () => {
      createDetailsBox();
    });
  }

  // Fetch images from the server and display them
  async function fetchImages() {
    try {
      const response = await fetch("/images"); // 서버에서 이미지 목록을 가져오는 엔드포인트
      if (response.ok) {
        const result = await response.json();
        displayImages(result);
      } else {
        console.error("Failed to fetch images");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Display fetched images
  function displayImages(result) {
    const imageGallery = document.querySelector("#image-gallery");
    imageGallery.innerHTML = ""; // Clear existing images

    if (result.images && result.images.length > 0) {
      result.images.forEach((image) => {
        const imgContainer = document.createElement("div");
        imgContainer.className = "image-container";
        imgContainer.innerHTML = `
                    <img src="${image.url}" alt="Image">
                    <button class="select-button" data-image-id="${image.id}">Select</button>
                `;
        imageGallery.appendChild(imgContainer);
      });

      // Add event listeners for select buttons
      document.querySelectorAll(".select-button").forEach((button) => {
        button.addEventListener("click", () => {
          handleImageSelect(button.dataset.imageId);
        });
      });
    } else {
      imageGallery.innerHTML = `
                <p>No images available</p>
            `;
    }
  }

  // Handle image selection
  function handleImageSelect(imageId) {
    selectedImageId = imageId; // Update selected image ID
    document.querySelector("#select-image-button").disabled = false; // Enable button
    console.log(`Image with ID ${imageId} selected`);
  }

  // Create overlay when mybody is clicked
  mybody.addEventListener("click", () => {
    createOverlay(`
            <div class="dynamic-box">
                <button class="close-button">&times;</button>
                <h1 class="title">Body Info</h1>
                <h2 class="sub-title">Edit and save your changed body measurement.</h2>
                
                <div class="form-group">
                    <label for="height">Height</label>
                    <input type="text" id="height" name="height">
                    <select id="height-unit" name="height-unit">
                        <option value="cm">cm</option>
                        <option value="inch">inch</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="weight">Weight</label>
                    <input type="text" id="weight" name="weight">
                    <select id="weight-unit" name="weight-unit">
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="waist">Waist</label>
                    <input type="text" id="waist" name="waist">
                    <select id="waist-unit" name="waist-unit">
                        <option value="inch">inch</option>
                        <option value="cm">cm</option>
                    </select>
                </div>
                <button class="submit-button">Save</button>
            </div>
        `);

    document
      .querySelector(".submit-button")
      .addEventListener("click", function () {
        const height = document.getElementById("height").value;
        const heightUnit = document.getElementById("height-unit").value;
        const weight = document.getElementById("weight").value;
        const weightUnit = document.getElementById("weight-unit").value;
        const waist = document.getElementById("waist").value;
        const waistUnit = document.getElementById("waist-unit").value;

        const data = {
          height: { value: height, unit: heightUnit },
          weight: { value: weight, unit: weightUnit },
          waist: { value: waist, unit: waistUnit },
        };

        console.log("AJAX 요청 전송:", data); // 디버그 메시지 추가

        fetch("body/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              alert("Body info saved successfully!");
            } else {
              alert("Failed to save body info.");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while saving body info.");
          });
      });
  });

  // Create overlay when mycloset is clicked
  mycloset.addEventListener("click", () => {
    createUploadBox();
  });

  // Handling Details Button click
  main.addEventListener("click", (event) => {
    if (event.target && event.target.classList.contains("upload-button")) {
      // Open details box without closing the upload box
      createDetailsBox();
    }
  });

  // Handle select image button click
  document
    .querySelector("#select-image-button")
    .addEventListener("click", () => {
      if (selectedImageId) {
        console.log(`Image with ID ${selectedImageId} will be processed`);
        // Implement further actions with the selected image ID
      } else {
        console.warn("No image selected");
      }
    });
});
