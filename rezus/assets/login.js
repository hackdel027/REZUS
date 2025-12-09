document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const popup = document.getElementById("errorPopup");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch("http://192.168.1.27:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {
                showError("Erreur lors de la connexion !");
                return;
            }

            const data = await response.json();

            if (!data.token) {
                showError("Erreur : aucun token reçu !");
                return;
            }

            // Stocker le token dans localStorage
            localStorage.setItem("jwt", data.token);

            // Redirection
            window.location.href = "../index.html";

        } catch (error) {
            showError("Impossible de contacter le serveur.");
        }
    });

    // Popup d’erreur rouge
    function showError(message) {
        popup.textContent = message;
        popup.style.display = "block";

        setTimeout(() => {
            popup.style.display = "none";
        }, 3000);
    }
});
