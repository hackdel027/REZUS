document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");
    const popup = document.getElementById("errorPopup");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Récupération des champs
        const userData = {
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value.trim(),
            nom: document.getElementById("fullname").value.trim(),
            pseudo: document.getElementById("pseudo").value.trim(),
            age: document.getElementById("age").value.trim(),
            lieu: document.getElementById("residence").value.trim(),
            pole: document.getElementById("pole").value.trim(),
            tel: document.getElementById("phone").value.trim()
        };

        try {
            const response = await fetch("http://192.168.1.27:3000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            // Vérification de la réponse HTTP
            if (!response.ok) {
                showError("Erreur : ", response.message);
                console.log(response);
                
                return;
            }

            const result = await response.json();

            // Vérifier si le backend renvoie un JWT
            if (!result.token) {
                showError("Erreur serveur : aucun token reçu.");
                return;
            }

            // 🔥 Stockage du JWT
            localStorage.setItem("jwt", result.token);

            // Redirection directe vers le dashboard
            window.location.href = "../index.html";

        } catch (error) {
            showError("Erreur réseau : serveur indisponible.");
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
