window.initLogs = async function () {
    const container = document.getElementById('logs-container');
    if (!container) {
        console.warn("logs-container introuvable, nouvel essai dans 50ms...");
        return setTimeout(window.initLogs, 50);
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
        container.innerHTML = `
            <tr><td colspan="4">Token manquant. Veuillez vous reconnecter.</td></tr>
        `;
        return;
    }

    try {
        const res = await fetch("http://192.168.1.27:3000/api/logs", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            container.innerHTML = `
                <tr><td colspan="4">Impossible de récupérer les logs.</td></tr>
            `;
            return;
        }

        const logs = await res.json();

        if (!Array.isArray(logs) || logs.length === 0) {
            container.innerHTML = `
                <tr><td colspan="4">Aucun log à afficher.</td></tr>
            `;
            return;
        }

        container.innerHTML = logs.map(log => `
            <tr>
                <td>${log.userId || "—"}</td>
                <td>${log.action || "—"}</td>
                <td>${log.description || "—"}</td>
                <td>${log.date || "—"}</td>
            </tr>
        `).join("");

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <tr><td colspan="4">Erreur lors de la récupération des logs.</td></tr>
        `;
    }
};
