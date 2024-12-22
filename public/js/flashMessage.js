document.addEventListener("DOMContentLoaded", function () {
    const flashMessage = document.getElementById("flashMessage");
    if (flashMessage) {
      setTimeout(() => {
        flashMessage.style.opacity = "0"; // Fade out
        setTimeout(() => {
          flashMessage.remove(); // Remove from DOM
        }, 500); // Delay to match fade-out transition
      }, 2000); // 2 seconds before starting to fade out
    }
  });
