// Konfiguracja Firebase (używamy Twoich danych)
const firebaseConfig = {
    apiKey: "AIzaSyD8qaNZKjmenGo0MxL4dI7MYb2khcHSUes",
    authDomain: "graznatalia-e1b58.firebaseapp.com",
    projectId: "graznatalia-e1b58",
    storageBucket: "graznatalia-e1b58.firebasestorage.app",
    messagingSenderId: "265631462505",
    appId: "1:265631462505:web:40b3bb8c72908cf8461ef8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const petRef = db.collection("pet").doc("shared-state");

// Stan początkowy
let petState = {
    hunger: 100,
    energy: 100,
    happy: 100,
    coins: 500,
    gems: 10,
    level: 1,
    xp: 0,
    outfit: 'none'
};

// Słuchaj zmian w bazie (Real-time!)
petRef.onSnapshot((doc) => {
    if (doc.exists) {
        petState = doc.data();
        updateUI();
    } else {
        // Inicjalizacja jeśli baza jest pusta
        petRef.set(petState);
    }
});

function updateUI() {
    document.getElementById('hunger-fill').style.width = petState.hunger + "%";
    document.getElementById('energy-fill').style.width = petState.energy + "%";
    document.getElementById('happy-fill').style.width = petState.happy + "%";
    document.getElementById('coins').innerText = petState.coins;
    document.getElementById('level-val').innerText = petState.level;
    
    // Renderowanie ubrań
    const layer = document.getElementById('clothing-layer');
    if(petState.outfit === 'sunglasses') {
        layer.innerHTML = '<rect x="70" y="95" width="60" height="10" fill="black" />';
    } else if(petState.outfit === 'hat') {
        layer.innerHTML = '<path d="M 60 70 L 140 70 L 100 30 Z" fill="red" />';
    } else {
        layer.innerHTML = '';
    }
}

// Akcje
async function performAction(type) {
    let update = {};
    if (type === 'feed') {
        update.hunger = Math.min(100, petState.hunger + 20);
        update.xp = petState.xp + 5;
    }
    if (type === 'play') {
        update.happy = Math.min(100, petState.happy + 25);
        update.energy = Math.max(0, petState.energy - 15);
        update.coins = petState.coins + 10;
        update.xp = petState.xp + 10;
    }
    
    // System Levelowania
    if (petState.xp >= petState.level * 100) {
        update.level = petState.level + 1;
        update.xp = 0;
        alert("LEVEL UP! Odblokowano nowe przedmioty!");
    }

    await petRef.update(update);
}

function toggleShop() {
    document.getElementById('shop-overlay').classList.toggle('hidden');
    renderShop();
}

function renderShop() {
    const items = [
        { id: 'sunglasses', name: 'Okulary', price: 100, type: 'coins' },
        { id: 'hat', name: 'Czapka Maga', price: 250, type: 'coins' }
    ];
    
    const container = document.getElementById('shop-items');
    container.innerHTML = items.map(item => `
        <div class="shop-item">
            <p>${item.name}</p>
            <button onclick="buyItem('${item.id}', ${item.price})">${item.price} 🪙</button>
        </div>
    `).join('');
}

async function buyItem(id, price) {
    if (petState.coins >= price) {
        await petRef.update({
            coins: petState.coins - price,
            outfit: id
        });
        alert("Kupiono!");
    } else {
        alert("Brak kasy!");
    }
}

// Spadek statystyk w czasie
setInterval(() => {
    petRef.update({
        hunger: Math.max(0, petState.hunger - 1),
        energy: Math.max(0, petState.energy - 0.5)
    });
}, 15000); // co 15 sekund
