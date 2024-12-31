const carouselSlides = document.querySelectorAll('.carousel-slide');
let currentSlide = 0;

document.querySelector('.prev').addEventListener('click', () => {
    carouselSlides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
    carouselSlides[currentSlide].classList.add('active');
});

document.querySelector('.next').addEventListener('click', () => {
    carouselSlides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % carouselSlides.length;
    carouselSlides[currentSlide].classList.add('active');
});

let locationsData = [];
let tagsData = [];
let restaurantGroupIndex = 0;
let cafeGroupIndex = 0;
const locationsPerGroup = 3; // Số lượng location hiển thị mỗi lần

async function fetchLocations() {
    try {
        // Get locations data from global variable
        const locationsResponse = await fetch('/locations');
        locationsData = await locationsResponse.json();
        if (!Array.isArray(locationsData)) {
            locationsData = [locationsData];
        }

        // Get tags data from global variable
        const tagsResponse = await fetch('/tags');
        tagsData = await tagsResponse.json();
        if (!Array.isArray(tagsData)) {
            tagsData = [tagsData];
        }

        const userResponse = await fetch('/users');
        const userData = await userResponse.json();
        if (!Array.isArray(userData)) {
            userData = [userData];
        }
        const currentUser = userData[0];

        locationsData.sort(compareLocations(currentUser));

        displayLocations();
        // setupNavButtons();
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu địa điểm:', error);
        document.getElementById('locations-container').innerHTML = '<p>Đã xảy ra lỗi khi lấy dữ liệu.</p>';
    }
}

function compareLocations(currentUser) {
    return function (a, b) {
        if (Array.isArray(currentUser.USER_DISTRICTS) && currentUser.USER_DISTRICTS.length > 0) {
            const aInDistrict = currentUser.USER_DISTRICTS.includes(a.LOC_DISTRICT);
            const bInDistrict = currentUser.USER_DISTRICTS.includes(b.LOC_DISTRICT);

            if (aInDistrict && !bInDistrict) {
                return -1;
            }
            if (!aInDistrict && bInDistrict) {
                return 1;
            }
        }

        const userPreferences = [
            ...(Array.isArray(currentUser.USER_CUISINES) ? currentUser.USER_CUISINES : []),
            ...(Array.isArray(currentUser.USER_MCOURSES) ? currentUser.USER_MCOURSES : []),
            ...(Array.isArray(currentUser.USER_DESSERTS) ? currentUser.USER_DESSERTS : []),
            ...(Array.isArray(currentUser.USER_ACTIVITIES) ? currentUser.USER_ACTIVITIES : [])
        ];

        const aMatches = countMatches(a, userPreferences);
        const bMatches = countMatches(b, userPreferences);

        if (aMatches > bMatches) {
            return -1;
        }
        if (aMatches < bMatches) {
            return 1;
        }

        return 0;
    };
}

function countMatches(location, preferences) {
    let matches = 0;
    const locationTags = location.LOC_TAG.split(',').map(tagID => tagID.trim());

    for (const preference of preferences) {
        for(const tagID of locationTags) {
            const tag = tagsData.find(tag => tag._id.trim() === tagID);

            if(tag){
                if(tag.TAG_ID === preference) {
                    matches++;
                }
            }
        }
    }
    return matches;
}

function displayLocations() {
    const container = document.getElementById('locations-container');
    container.innerHTML = ''; // Remove old data

    // Filter locations by tag
    const restaurants = locationsData.filter((loc) => {
        const locTagIds = loc.LOC_TAG.split(','); // Tách chuỗi LOC_TAG thành mảng các tag ID
        return locTagIds.some((tagId) => {
          const tag = tagsData.find((t) => t._id.trim() === tagId.trim()); // Trim để loại bỏ khoảng trắng
          return tag && tag.TAG_TYPE === 'Restaurant';
        });
    });

    console.log(restaurants[0]);
    
    const cafes = locationsData.filter((loc) => {
        const locTagIds = loc.LOC_TAG.split(','); // Tách chuỗi LOC_TAG thành mảng các tag ID
        return locTagIds.some((tagId) => {
            const tag = tagsData.find((t) => t._id.trim() === tagId.trim()); // Trim để loại bỏ khoảng trắng
            return tag && tag.TAG_TYPE === 'Cafe';
        });
    });

    console.log(cafes[0]);

    // Display locations for group restaurants
    displayGroup(
        restaurants,
        restaurantGroupIndex,
        'Must-try Restaurants',
        'restaurants-container',
    );

    // Display locations for group cafes
    displayGroup(
        cafes,
        cafeGroupIndex,
        'Must-try Coffee shops',
        'cafes-container',
    );  
}

function displayGroup(locations, groupIndex, title, containerID) {
    const container = document.getElementById('locations-container');
    const groupContainer = document.createElement('div');
    groupContainer.id = containerID;
    groupContainer.classList.add('locations-group');
    container.appendChild(groupContainer);

    const startIndex = groupIndex * locationsPerGroup;
    const endIndex = startIndex + locationsPerGroup;
    const currentLocations = locations.slice(startIndex, endIndex);

    // Display group title
    const titleDiv = document.createElement('h2');
    titleDiv.innerText = title;
    groupContainer.appendChild(titleDiv);

    // Add div containing location records
    const recordsContainer = document.createElement('div');
    recordsContainer.classList.add('records-container');
    groupContainer.appendChild(recordsContainer);

    currentLocations.forEach((location) => {
        const locationDiv = document.createElement('div');
        locationDiv.classList.add('location-record');

        const imageUrl = `/proxy-image?url=${encodeURIComponent(
            location.LOC_PHOTO
        )}`;

        const locationHtml = `
            <div class="image-container">
                <div class="location-image" style="background-image: url('${imageUrl}');"></div>
                <div class="heart-icon">
                    <span class="icon">❤️</span>
                </div>
            </div>
            <div class="location-details">
                <div class="location-name">${location.LOC_NAME}</div>
                <div class="detail-item">
                    <span class="icon">⭐</span>
                    <span>${location.LOC_RATING}</span>
                </div>
                <div class="detail-item">
                    <span class="icon">📍</span>
                    <span>${location.LOC_DISTRICT}</span>
                </div>
                <div class="detail-item">
                    <span class="icon">💵</span>
                    <span class="price">From ${formatPrice(location.LOC_PRICE)}</span>
                </div>
            </div>
        `;
        locationDiv.innerHTML = locationHtml;
        recordsContainer.appendChild(locationDiv);
    });

    // Display navigation buttons
    addNavigationForGroup(groupContainer, locations, groupIndex, containerID.replace('-container', ''));
}

function addNavigationForGroup(groupContainer, locations, groupIndex, groupName) {
    const navDiv = document.createElement('div');
    navDiv.classList.add('nav-buttons');

    const prevBtn = document.createElement('button');
    prevBtn.id = `${groupName}-prev-btn`;
    prevBtn.classList.add('nav-btn');
    prevBtn.textContent = '❮';
    prevBtn.addEventListener('click', () => {
        if (groupIndex > 0) {
            groupIndex--;
            if (groupName === 'restaurants') {
                restaurantGroupIndex = groupIndex;
            } else if (groupName === 'cafes') {
                cafeGroupIndex = groupIndex;
            }

            // Update again for corresponding group
            updateDisplayGroup(locations, groupIndex, groupName);
        }
    });

    const nextBtn = document.createElement('button');
    nextBtn.id = `${groupName}-next-btn`;
    nextBtn.classList.add('nav-btn');
    nextBtn.textContent = '❯';
    nextBtn.addEventListener('click', () => {
        if ((groupIndex + 1) * locationsPerGroup < locations.length) {
            groupIndex++;
            if (groupName === 'restaurants') {
                restaurantGroupIndex = groupIndex;
            } else if (groupName === 'cafes') {
                cafeGroupIndex = groupIndex;
            }

            // Update again for corresponding group
            updateDisplayGroup(locations, groupIndex, groupName);
        }
    });

    navDiv.appendChild(prevBtn);
    navDiv.appendChild(nextBtn);
    groupContainer.appendChild(navDiv);

}

function updateDisplayGroup(locations, groupIndex, groupName) {
    const containerID = `${groupName}-container`;
    const container = document.getElementById(containerID).querySelector('.records-container');
    container.innerHTML = ''; // Remove old data

    const startIndex = groupIndex * locationsPerGroup;
    const endIndex = startIndex + locationsPerGroup;
    const currentLocations = locations.slice(startIndex, endIndex);

    currentLocations.forEach((location) => {
        const locationDiv = document.createElement('div');
        locationDiv.classList.add('location-record');

        const imageUrl = `/proxy-image?url=${encodeURIComponent(
            location.LOC_PHOTO
        )}`;

        const locationHtml = `
              <div class="image-container">
                  <div class="location-image" style="background-image: url('${imageUrl}');"></div>
                  <div class="heart-icon">
                      <span class="icon">❤️</span>
                  </div>
              </div>
              <div class="location-details">
                  <div class="location-name">${location.LOC_NAME}</div>
                  <div class="detail-item">
                      <span class="icon">⭐</span>
                      <span>${location.LOC_RATING}</span>
                  </div>
                  <div class="detail-item">
                      <span class="icon">📍</span>
                      <span>${location.LOC_DISTRICT}</span>
                  </div>
                  <div class="detail-item">
                      <span class="icon">💵</span>
                      <span class="price">From ${formatPrice(location.LOC_PRICE)}</span>
                  </div>
              </div>
          `;
        locationDiv.innerHTML = locationHtml;
        recordsContainer.appendChild(locationDiv);
    });
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

fetchLocations();