// Array of certificate image URLs
const certificates = [
    "https://media.licdn.com/dms/image/v2/D5622AQGFwQmYdFX70g/feedshare-shrink_1280/feedshare-shrink_1280/0/1730349065745?e=1745452800&v=beta&t=pgvKJLHDxd-ghhCxdWAHeP_lAQ5MDnNHuKl8qcN_1Fs", // Python essential traning
    "https://media.licdn.com/dms/image/v2/D4E22AQFIjT62qR2tlg/feedshare-shrink_1280/feedshare-shrink_1280/0/1729765257945?e=1745452800&v=beta&t=pPnrqX5qhxP4PMovigy0tJ2hM8yR8g83nOKkRxrjXbQ", // advance python: bulid hands-on-projects with design patterns
    "https://media.licdn.com/dms/image/v2/D5622AQGMa95GvcVi2A/feedshare-shrink_1280/feedshare-shrink_1280/0/1730891683550?e=1745452800&v=beta&t=OC-rVpwSBhYzUGRHpjaE-TAGQ9EgKZ1iFpoWNCi70Ro", // Python standard library essential traning
    "https://media.licdn.com/dms/image/v2/D5622AQGcKzlXzM9fUA/feedshare-shrink_1280/feedshare-shrink_1280/0/1731149353822?e=1745452800&v=beta&t=o1BukW03zKAFSKMzCS4qBRRhnnlmu58p3lg0RWGFpMg", // Python practice: OOP
    "https://media.licdn.com/dms/image/v2/D5622AQEOD5Mgz9MWgw/feedshare-shrink_1280/feedshare-shrink_1280/0/1730712694465?e=1745452800&v=beta&t=tH_Al8HSpyY2cXf0PfSM24j-IGPRfp8TH3nd9-ONEAk", // programming concepts for python
    "../resources/certificates/Python_for_Beginners_E-Certificate.png",
    "../resources/certificates/Microsoft Learn build real world application using python.png",
    "../resources/certificates/Microsoft Learn solve python.png"
];

// Function to display the images dynamically and animate them
let currentIndex = 0;

function displayCertificates() {
    const certificate = document.getElementById("certificate");

    // Create and append 3 images initially
    updateCertificate();

    // Update the certificate position every 3 seconds
    setInterval(() => {
        currentIndex = (currentIndex + 1) % certificates.length; // Loop through the images
        updateCertificate();
    }, 3000); // Change images every 3 seconds
}

function updateCertificate() {
    const certificate = document.getElementById("certificate");
    certificate.innerHTML = ""; // Clear existing images

    // Add 3 images in the certificate
    for (let i = 0; i < 2; i++) {
        const imgIndex = (currentIndex + i) % certificates.length;
        const imgElement = document.createElement("img");
        imgElement.src = certificates[imgIndex];
        imgElement.classList.add("certificate-img");
        certificate.appendChild(imgElement);
    }

}

// Call the function on page load
window.onload = displayCertificates;