document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwt");

    if (!token) {
        window.location.href = "./pages/login.html";
        return;
    }

    try {
        const response = await fetch("http://192.168.1.27:3000/api/auth/verify", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // Token invalide
            localStorage.removeItem("jwt");          
            window.location.href = "./pages/login.html";
        } else {
            // Token valide - décoder et afficher le pseudo
            const decoded = JSON.parse(atob(token.split('.')[1])); // Décoder payload JWT
            const pseudo = decoded.pseudo;

            // Afficher le pseudo dans la sidebar ou un endroit visible
            const pseudoDisplay = document.getElementById('user-pseudo');
            if (pseudoDisplay) {
                pseudoDisplay.textContent = pseudo;
            }
        }
        // Token valide -> le dashboard s'affiche normalement
    } catch (error) {
        console.error("Erreur de connexion pour vérifier le token :", error);
        localStorage.removeItem("jwt");
        window.location.href = "./pages/login.html";
    }
});