import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyD8qaNZKjmenGo0MxL4dI7MYb2khcHSUes",
    authDomain: "graznatalia-e1b58.firebaseapp.com",
    projectId: "graznatalia-e1b58",
    storageBucket: "graznatalia-e1b58.firebasestorage.app",
    messagingSenderId: "265631462505",
    appId: "1:265631462505:web:40b3bb8c72908cf8461ef8",
    measurementId: "G-JWW9JW9TD0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Game State
let pet = {
    stats: { hunger: 100, energy: 100, happy: 100 },
    lvl: 1,
    xp: 0,
    coins: 500,
    diamonds: 10,
    bond: 1,
    inventory: []
};

// Core Loop
function updateUI() {
    document.getElementById('hunger-fill').style.width = pet.stats.hunger + '%';
    document.getElementById('energy-fill').style.width = pet.stats.energy + '%';
    document.getElementById('happy-fill').style.width = pet.stats.happy + '%';
    document.getElementById('lvl').innerText = pet.lvl;
    document.getElementById('xp').innerText = pet.xp;
    document.getElementById('coins').innerText = pet.coins;
    document.getElementById('diamonds').innerText = pet.diamonds;
    document.getElementById('bond-lvl').innerText = pet.bond;
}

// Actions
window.action = (type) => {
    switch(type) {
        case 'feed':
            if(pet.stats.hunger < 100) {
                pet.stats.hunger = Math.min(100, pet.stats.hunger + 20);
                gainXP(10);
                addMessage("Mniam! Pyszne jedzenie.");
            }
            break;
        case 'play':
            if(pet.stats.energy > 20) {
                pet.stats.happy = Math.min(100, pet.stats.happy + 30);
                pet.stats.energy -= 15;
                pet.coins += 20; // Nagroda za zabawę
                gainXP(15);
            }
            break;
        case 'sleep':
            pet.stats.energy = 100;
            addMessage("Zzz... Zwierzak odpoczywa.");
            saveData();
            break;
    }
    updateUI();
};

function gainXP(amount) {
    pet.xp += amount;
    if(pet.xp >= 100) {
        pet.lvl++;
        pet.xp = 0;
        pet.diamonds += 1;
        alert("LEVEL UP! Masz teraz poziom " + pet.lvl);
    }
}

// Chat NPC Logic
window.interactWithGirl = () => {
    const messages = [
        "Cześć! Jak się miewa Twój pupil?",
        "Wygląda na to, że świetnie się nim opiekujesz.",
        "Wiedziałeś, że diamenty można zdobyć za awansowanie?",
        "Mój ulubiony kolor to złoty, może go kupisz?"
    ];
    const rand = messages[Math.floor(Math.random() * messages.length)];
    pet.bond += 0.1;
    addMessage("Dziewczyna: " + rand);
    updateUI();
};

function addMessage(txt) {
    const chat = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'msg';
    div.innerText = txt;
    chat.prepend(div);
}

// Shop
window.toggleShop = () => {
    document.getElementById('shop-modal').classList.toggle('hidden');
};

window.buyItem = (id, cost, currency = 'coins') => {
    if(pet[currency] >= cost) {
        pet[currency] -= cost;
        pet.inventory.push(id);
        alert("Kupiono: " + id);
        updateUI();
        saveData();
    } else {
        alert("Brak środków!");
    }
};

// Database Persistence
async function saveData() {
    try {
        await setDoc(doc(db, "users", "player_1"), pet);
        console.log("Dane zapisane!");
    } catch (e) {
        console.error("Błąd zapisu: ", e);
    }
}

async function loadData() {
    const docRef = doc(db, "users", "player_1");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        pet = docSnap.data();
        updateUI();
    }
}

// Stats Decay (Autonoma)
setInterval(() => {
    pet.stats.hunger = Math.max(0, pet.stats.hunger - 0.5);
    pet.stats.happy = Math.max(0, pet.stats.happy - 0.3);
    updateUI();
}, 5000);

// Init
window.onload = () => {
    loadData();
};
