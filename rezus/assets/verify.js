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
            localStorage.removeItem("jwt");
            window.location.href = "./pages/login.html";
            return;
        }

        const data = await response.json();
        const user = data.user;

        // redirect if not admin
        if (user.role == "agent") {
            window.location.href = "./user_dashboard.html";
            return;
        }

        // afficher pseudo
        const pseudoDisplay = document.getElementById('user-pseudo');
        if (pseudoDisplay) pseudoDisplay.textContent = user.pseudo;

    } catch (error) {
        console.error("verify token error:", error);
        localStorage.removeItem("jwt");
        window.location.href = "./pages/login.html";
    }
});

