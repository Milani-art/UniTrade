// PRODUCT DATA
let productsData = [
    { id: 1, name: "Autos Wireless", price: 540.90, originalPrice: 600.00, category: "Home", isUserListed: false },
    { id: 2, name: "Smart Watch PVR", price: 600.00, originalPrice: 1250.00, category: "Home", isUserListed: false },
    { id: 3, name: "Controller Elite", price: 544.99, originalPrice: 850.00, category: "Home", isUserListed: false },
    { id: 4, name: "AirPods Pro", price: 844.99, originalPrice: 850.00, category: "Home", isUserListed: false },
    { id: 5, name: "AirPods Max", price: 843.99, originalPrice: 850.00, category: "Home", isUserListed: false },
    { id: 6, name: "Classic Tee", price: 29.99, originalPrice: 49.99, category: "Shirts", isUserListed: false },
    { id: 7, name: "Denim Jacket", price: 79.99, originalPrice: 129.99, category: "Mens Wear", isUserListed: false },
    { id: 8, name: "Floral Dress", price: 59.99, originalPrice: 99.99, category: "Women Wear", isUserListed: false },
    { id: 9, name: "Running Shoes", price: 89.99, originalPrice: 149.99, category: "Shoes", isUserListed: false },
    { id: 10, name: "Leather Sofa", price: 499.99, originalPrice: 799.99, category: "Furniture", isUserListed: false },
    { id: 11, name: "Smart Lamp", price: 39.99, originalPrice: 69.99, category: "Home", isUserListed: false },
    { id: 12, name: "Casual Shorts", price: 34.99, originalPrice: 59.99, category: "Clothes", isUserListed: false }
];

let nextId = 13;


const categoriesList = ["All", "Home", "Furniture", "Shirts", "Mens Wear", "Women Wear", "Shoes", "Clothes", "Electronics", "Accessories"];


let currentPage = 1;
const itemsPerPage = 5;
let currentCategory = "All";
let currentSearchTerm = "";


function getFilteredProducts() {
    let filtered = [...productsData];
    if (currentCategory !== "All") {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    if (currentSearchTerm.trim() !== "") {
        const term = currentSearchTerm.trim().toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
    }
    return filtered;
}

function getPaginatedProducts(filteredProducts) {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return filteredProducts.slice(startIdx, endIdx);
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderProducts() {
    const filtered = getFilteredProducts();
    const totalFiltered = filtered.length;
    const paginatedItems = getPaginatedProducts(filtered);
    const container = document.getElementById("productsGridContainer");

    if (!container) return;

    if (paginatedItems.length === 0) {
        container.innerHTML = `<div class="no-results"><i class="fas fa-box-open fa-2x" style="opacity:0.5; margin-bottom:1rem; display:block;"></i> No products found <br> Try another category or search term</div>`;
        updatePaginationUI(totalFiltered);
        return;
    }

    let cardsHtml = "";
    for (let product of paginatedItems) {
        const discountPercent = ((product.originalPrice - product.price) / product.originalPrice * 100).toFixed(0);
        const hasDiscount = product.originalPrice > product.price;
        const isUserItem = product.isUserListed;

        cardsHtml += `
      <div class="product-card">
        ${isUserItem ? '<div class="listing-badge"><i class="fas fa-user-plus"></i> Listed by You</div>' : ''}
        <div class="card-img">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 7L12 12L4 7M20 7V17L12 22L4 17V7M20 7L12 2L4 7" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 12V22M12 12L20 7M12 12L4 7" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="card-info">
          <div class="product-title">${escapeHtml(product.name)}</div>
          <div class="price-row">
            <span class="current-price">R${product.price.toFixed(2)}</span>
            ${hasDiscount ? `<span class="old-price">R${product.originalPrice.toFixed(2)}</span>` : ''}
          </div>
          ${hasDiscount ? `<div class="discount-badge">-${discountPercent}% OFF</div>` : '<div style="height:22px;"></div>'}
        </div>
      </div>
    `;
    }
    container.innerHTML = cardsHtml;
    updatePaginationUI(totalFiltered);
}

function updatePaginationUI(totalFiltered) {
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
    const startIndex = totalFiltered === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalFiltered);
    const showingSpan = document.getElementById("showingRangeInfo");
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");

    if (totalFiltered === 0) {
        showingSpan.innerText = `Showing 0 of 0 results`;
    } else {
        showingSpan.innerText = `Showing ${startIndex} to ${endIndex} of ${totalFiltered} results`;
    }

    if (prevBtn) prevBtn.disabled = (currentPage === 1);
    if (nextBtn) nextBtn.disabled = (currentPage === totalPages || totalPages === 0);

    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
        renderProducts();
    }
}

function resetAndRender() {
    currentPage = 1;
    renderProducts();
}

function initCategoryFilters() {
    const catContainer = document.getElementById("categoryList");
    if (!catContainer) return;

    catContainer.innerHTML = "";
    categoriesList.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = `cat-btn ${currentCategory === cat ? "active" : ""}`;
        let iconClass;
        if (cat === "All") iconClass = "fas fa-border-all";
        else if (cat === "Home") iconClass = "fas fa-home";
        else if (cat === "Furniture") iconClass = "fas fa-couch";
        else if (cat === "Shirts") iconClass = "fas fa-t-shirt";
        else if (cat === "Mens Wear") iconClass = "fas fa-male";
        else if (cat === "Women Wear") iconClass = "fas fa-female";
        else if (cat === "Shoes") iconClass = "fas fa-shoe-prints";
        else if (cat === "Clothes") iconClass = "fas fa-hanger";
        else if (cat === "Electronics") iconClass = "fas fa-microchip";
        else if (cat === "Accessories") iconClass = "fas fa-gem";
        else iconClass = "fas fa-tag";

        btn.innerHTML = `<i class="${iconClass}"></i> ${cat}`;
        btn.addEventListener("click", () => {
            currentCategory = cat;
            resetAndRender();
            document.querySelectorAll(".cat-btn").forEach(btnEl => btnEl.classList.remove("active"));
            btn.classList.add("active");
        });
        catContainer.appendChild(btn);
    });
}

function initSearchListener() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    searchInput.addEventListener("input", (e) => {
        currentSearchTerm = e.target.value;
        resetAndRender();
    });
}

function initPaginationEvents() {
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            const filteredTotal = getFilteredProducts().length;
            const totalPages = Math.ceil(filteredTotal / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
            }
        });
    }
}


function initSellForm() {
    const form = document.getElementById("sellForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("productName").value.trim();
        const category = document.getElementById("productCategory").value;
        const price = parseFloat(document.getElementById("productPrice").value);
        const originalPrice = parseFloat(document.getElementById("productOriginalPrice").value);

        // Validation
        if (!name || !category || isNaN(price) || isNaN(originalPrice)) {
            alert("Please fill in all fields correctly");
            return;
        }

        if (price <= 0 || originalPrice <= 0) {
            alert("Prices must be greater than zero");
            return;
        }

        if (price > originalPrice) {
            alert("Selling price cannot be higher than original price");
            return;
        }


        const newProduct = {
            id: nextId++,
            name: name,
            price: price,
            originalPrice: originalPrice,
            category: category,
            isUserListed: true
        };


        productsData.unshift(newProduct);


        form.reset();


        currentCategory = "All";
        currentSearchTerm = "";
        document.getElementById("searchInput").value = "";
        resetAndRender();


        document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
        const allBtn = Array.from(document.querySelectorAll(".cat-btn")).find(btn => btn.innerText.trim() === "All");
        if (allBtn) allBtn.classList.add("active");


        alert(`"${name}" has been listed for sale at R${price.toFixed(2)}!`);
    });
}

function init() {
    initCategoryFilters();
    initSearchListener();
    initPaginationEvents();
    initSellForm();
    currentCategory = "All";
    currentSearchTerm = "";
    const allCatBtn = Array.from(document.querySelectorAll(".cat-btn")).find(btn => btn.innerText.trim() === "All");
    if (allCatBtn) {
        document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
        allCatBtn.classList.add("active");
    }
    renderProducts();
}

document.addEventListener("DOMContentLoaded", init);