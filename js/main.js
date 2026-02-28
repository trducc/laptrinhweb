document.querySelectorAll('.fa-heart').forEach(heart => {
    heart.parentElement.addEventListener('click', function(e) {
        e.preventDefault();
        if(heart.classList.contains('fa-regular')) {
            heart.classList.remove('fa-regular');
            heart.classList.add('fa-solid');
        } else {
            heart.classList.remove('fa-solid');
            heart.classList.add('fa-regular');
        }
    });
});

function togglePass(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    }
}