document.addEventListener('DOMContentLoaded', () => {
  // délégation pour fonctionner si le fragment est injecté dynamiquement
  document.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('#ajoute_agent');
    if (!btn) return;

    ev.preventDefault();

    const getVal = id => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const payload = {
      nom: getVal('fullname') || getVal('nom'), // accepte les deux si besoin
      email: getVal('email'),
      password: getVal('password'),
      pseudo: getVal('pseudo'),
      age: parseInt(getVal('age'), 10) || 0,
      pole: getVal('pole'),
      lieu: getVal('residence'),
      tel: getVal('phone'),
      role: getVal('role') || 'agent'
    };

    // validation minimale
    if (!payload.email || !payload.password || !payload.nom || !payload.pseudo) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      const token = localStorage.getItem('jwt'); // si route protégée
      const res = await fetch('http://192.168.1.27:3000/api/addAgent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert('Agent ajouté avec succès');
        const form = document.getElementById('addAgentForm');
        if (form) form.reset();
        // optionnel : charger la vue liste, etc.
      } else {
        alert(`Erreur : ${data.message || res.statusText}`);
      }
    } catch (err) {
      console.error('Erreur addAgent:', err);
      alert('Erreur de connexion au serveur');
    }
  });
});