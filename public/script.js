// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
console.log("✅ script.js has been loaded successfully!");
console.log("✅ Firestore Functions Loaded:", { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where, getDoc });
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkoUBeR4DD8BXYf6DcaUxRBcis3VsYiIg",
    authDomain: "catering-system-bf74d.firebaseapp.com",
    projectId: "catering-system-bf74d",
    storageBucket: "catering-system-bf74d.appspot.com",
    messagingSenderId: "758238167131",
    appId: "1:758238167131:web:40ac87726f9bde66c57f7e",
    measurementId: "G-MHRF3KEL44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Firebase initialized successfully!");

// Show Signup Form
window.showSignup = function () {
    document.getElementById("signup-section").style.display = "block";
};

// User Signup
window.signupUser = async function () {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    
    if (!email || !password) {
        alert("Please enter an email and password.");
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Signup successful! You can now log in.");
    } catch (error) {
        alert("Signup Error: " + error.message);
        console.error(error);
    }
};

// User Login
window.loginUser = async function () {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    } catch (error) {
        console.error("Login Error:", error);
        if (error.code === "auth/user-not-found") {
            alert("User not found. Please sign up first.");
        } else if (error.code === "auth/wrong-password") {
            alert("Incorrect password. Try again.");
        } else {
            alert("Login failed: " + error.message);
        }
    }
};

// Logout
window.logoutUser = async function () {
    await signOut(auth);
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
    alert("Logged out successfully!");
};

// Track Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user.email);
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    } else {
        console.log("No user logged in.");
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("dashboard").style.display = "none";
    }
});

// Function to display data on the webpage
function displayData(title, content) {
    console.log("✅ displayData() called with:", title, content); // Debug Log

    const dataDisplay = document.getElementById("data-display");
    const dataTitle = document.getElementById("data-title");
    const dataContent = document.getElementById("data-content");

    if (!dataDisplay || !dataTitle || !dataContent) {
        console.error("❌ Error: Data display elements not found in HTML.");
        return;
    }

    dataTitle.innerText = title;
    dataContent.innerText = content || "No data available.";
    dataDisplay.style.display = "block";  // Show the data display section

    console.log("✅ Updated UI:", dataDisplay.style.display);
}
window.addMenuItem = async function () {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("❌ You must be logged in to add menu items.");
            return;
        }

        const name = prompt("Enter menu item name:");
        if (!name) return alert("❌ Menu item name is required.");

        const price = prompt("Enter price:");
        if (!price || isNaN(price)) return alert("❌ Enter a valid price.");

        const category = prompt("Enter category:");
        if (!category) return alert("❌ Category is required.");

        // Check if item already exists
        const menuQuery = query(collection(db, "menu"), where("name", "==", name));
        const existingMenu = await getDocs(menuQuery);
        if (!existingMenu.empty) {
            return alert("❌ This item is already in the menu!");
        }

        await addDoc(collection(db, "menu"), { name, price, category });

        alert("✅ Menu item added successfully!");
    } catch (error) {
        console.error("❌ Error adding menu item:", error);
        alert("❌ Failed to add menu item. Check permissions.");
    }
};

// View Menu
window.viewMenu = async function () {
    try {
        const querySnapshot = await getDocs(collection(db, "menu"));
        let menuList = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`📜 Menu Item: ${data.name} - ₹${data.price} (${data.category})`);
            menuList += `🍽️ ${data.name} - ₹${data.price} (${data.category})\n`;
        });

        displayData("📜 Menu Items", menuList || "No menu items found.");
    } catch (error) {
        console.error("❌ Error fetching menu:", error);
        displayData("Error", "Failed to load menu.");
    }
};
window.addInventoryItem = async function () {
    try {
        const name = prompt("Enter inventory item name:");
        if (!name) return alert("Inventory item name is required.");

        const quantity = prompt("Enter quantity:");
        if (!quantity || isNaN(quantity)) return alert("Enter a valid quantity.");

        // Check if item exists in the menu first
        const menuQuery = query(collection(db, "menu"), where("name", "==", name));
        const menuItem = await getDocs(menuQuery);
        if (menuItem.empty) {
            return alert("❌ This item is not in the menu, so it cannot be added to inventory!");
        }

        await addDoc(collection(db, "inventory"), { name, quantity });

        alert("✅ Inventory item added successfully!");
    } catch (error) {
        console.error("❌ Error adding inventory item:", error);
        alert("Failed to add inventory item.");
    }
};

// View Inventory
window.viewInventory = async function () {
    try {
        const querySnapshot = await getDocs(collection(db, "inventory"));
        let inventoryList = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`📦 Inventory Item: ${data.name} - Quantity: ${data.quantity}`);
            inventoryList += `📌 ${data.name} - Quantity: ${data.quantity}\n`;
        });

        displayData("📦 Inventory Items", inventoryList || "No inventory items found.");
    } catch (error) {
        console.error("❌ Error fetching inventory:", error);
        displayData("Error", "Failed to load inventory.");
    }
};
window.takeOrder = async function () {
    try {
        const customerName = prompt("Enter customer name:");
        if (!customerName) return alert("Order cancelled.");

        const items = prompt("Enter items (comma-separated):").split(",").map(item => item.trim());
        if (items.length === 0) return alert("No items entered.");

        // Create a new order document and get the generated ID
        const docRef = await addDoc(collection(db, "orders"), {
            customerName: customerName,
            items: items,
            status: "Pending"
        });

        // Update the same document with the generated order ID
        await updateDoc(doc(db, "orders", docRef.id), { orderId: docRef.id });

        alert(`✅ Order placed successfully!\nOrder ID: ${docRef.id}`);
    } catch (error) {
        console.error("❌ Error placing order:", error);
        alert("Failed to place order.");
    }
};


// View Orders
window.viewOrders = async function () {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("❌ You must be logged in to view orders.");
            return;
        }

        console.log(`🔍 Fetching orders for user: ${user.email}`);

        const querySnapshot = await getDocs(collection(db, "orders"));
        let orderList = "";

        if (querySnapshot.empty) {
            displayData("🛒 Orders", "No orders found.");
            return;
        }

        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            console.log(`🛒 Order: ${data.customerName}, Items: ${data.items.join(", ")}, Status: ${data.status}`);

            const orderStatus = data.status || "Pending";
            const orderId = data.orderId || doc.id;

            let totalAmount = 0;
            for (let item of data.items) {
                const menuQuery = query(collection(db, "menu"), where("name", "==", item));
                const menuSnapshot = await getDocs(menuQuery);
                menuSnapshot.forEach((menuItem) => {
                    totalAmount += Number(menuItem.data().price);
                });
            }

            orderList += `🆔 Order ID: ${orderId}\n👤 Customer: ${data.customerName}\n📦 Items: ${data.items.join(", ")}\n💰 Amount: ₹${totalAmount}\n📌 Status: ${orderStatus}\n\n`;
        }

        displayData("🛒 Orders", orderList);
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        alert("❌ You do not have permission to view orders.");
    }
};

window.completeOrder = async function () {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("❌ You must be logged in to update an order.");
            return;
        }

        const orderId = prompt("Enter Order ID to mark as completed:");
        if (!orderId) {
            alert("❌ No order ID provided!");
            return;
        }

        console.log(`🔍 Checking Firestore for Order ID: ${orderId}`);

        // ✅ Ensure `getDoc` is correctly fetching the document
        const orderRef = doc(db, "orders", orderId);
        const orderSnapshot = await getDoc(orderRef);

        if (!orderSnapshot.exists()) {
            console.error(`❌ Order ID ${orderId} not found in Firestore.`);
            alert(`❌ Order ID ${orderId} not found!`);
            return;
        }

        console.log(`✅ Found Order:`, orderSnapshot.data());

        // ✅ Update order status
        await updateDoc(orderRef, { status: "Completed" });

        alert(`✅ Order ${orderId} marked as Completed!`);
        viewOrders(); // Refresh orders after update
    } catch (error) {
        console.error("❌ Error updating order status:", error);
        alert("❌ Failed to update order status. Check permissions.");
    }
};

window.onload = function () {
    document.getElementById("loginBtn").addEventListener("click", loginUser);
    document.getElementById("signupBtn").addEventListener("click", signupUser);

    // Attach event listeners only if buttons exist
    const viewMenuBtn = document.querySelector("button[onclick='viewMenu()']");
    const viewInventoryBtn = document.querySelector("button[onclick='viewInventory()']");
    const viewOrdersBtn = document.querySelector("button[onclick='viewOrders()']");
    
    if (viewMenuBtn) viewMenuBtn.addEventListener("click", viewMenu);
    if (viewInventoryBtn) viewInventoryBtn.addEventListener("click", viewInventory);
    if (viewOrdersBtn) viewOrdersBtn.addEventListener("click", viewOrders);

    console.log("✅ Event listeners added successfully.");
};
// Attach functions to window so they work in modules
window.addMenuItem = addMenuItem;
window.addInventoryItem = addInventoryItem;
window.takeOrder = takeOrder;
window.viewOrders = viewOrders;
window.completeOrder = completeOrder;
window.viewMenu = viewMenu;
window.viewInventory = viewInventory;
window.signupUser = signupUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.showSignup = showSignup;
if (typeof getDoc !== "undefined") {
    window.getDoc = getDoc;
    console.log("✅ getDoc successfully attached to window.");
} else {
    console.error("❌ getDoc is still undefined. Check import issues.");
}
console.log("✅ Functions attached to window:", window.addMenuItem, window.addInventoryItem, window.takeOrder);
document.getElementById("addMenuItemBtn").addEventListener("click", addMenuItem);
document.getElementById("addInventoryItemBtn").addEventListener("click", addInventoryItem);
document.getElementById("takeOrderBtn").addEventListener("click", takeOrder);
// Log functions attached to window
console.log("✅ Functions attached to window:", {
    addMenuItem: window.addMenuItem,
    addInventoryItem: window.addInventoryItem,
    takeOrder: window.takeOrder
});
