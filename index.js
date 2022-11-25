// variables y constantes
const cartContainer = document.querySelector('.cart-container');
const productList = document.querySelector('.product-list');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const cartList = document.querySelector('.cart-list');
const cartTotalValue = document.getElementById('cart-total-value');
const cartCountInfo = document.getElementById('cart-count-info');
let cartItemID = 1;
const overlay = document.querySelector('.overlay');

eventListeners();

// event listeners
function eventListeners() {
  window.addEventListener('DOMContentLoaded', () => {
    navMenu.addEventListener('click', closeOnClick);
    overlay.addEventListener('click', closeOnOverlayClick);
    window.addEventListener('scroll', closeOnScroll);
    loadJSON();
    loadCart();
  });

  //Menu Hamburguesa
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show-navmenu');
    if (navMenu.classList.contains('show-navmenu')) {
      navToggle.setAttribute('aria-label', 'closed-menu');
    } else {
      navToggle.setAttribute('aria-label', 'open-menu');
    }
    overlay.classList.toggle('show-overlay');

    if (cartContainer.classList.contains('show-cart-container')) {
      cartContainer.classList.remove('show-cart-container');
      overlay.classList.toggle('show-overlay');
    }
  });

  // mostrar/ocultar contenedor del carrito
  document.getElementById('cart-btn').addEventListener('click', () => {
    cartContainer.classList.toggle('show-cart-container');
    overlay.classList.toggle('show-overlay');
    if (navMenu.classList.contains('show-navmenu')) {
      navMenu.classList.remove('show-navmenu');
      overlay.classList.toggle('show-overlay');
    }
  });

  // agregar al carrito
  productList.addEventListener('click', addProduct);

  // borrar item del carrito
  cartList.addEventListener('click', deleteProduct);
}

// actualizamos la info del carrito
function updateCartInfo() {
  let cartInfo = findCartInfo();
  cartCountInfo.textContent = cartInfo.productCount;
  cartTotalValue.textContent = cartInfo.total;
}

//funciones para la interfaz del menú y el carrito de compras

const closeOnClick = (e) => {
  if (!e.target.classList.contains('nav-menu-item')) return;
  navMenu.classList.remove('show-navmenu');
  overlay.classList.remove('show-overlay');
  navToggle.classList.remove('hidden');
};

const closeOnOverlayClick = () => {
  navMenu.classList.remove('show-navmenu');
  cartContainer.classList.remove('show-cart-container');
  overlay.classList.remove('show-overlay');
  navToggle.classList.remove('hidden');
};

const closeOnScroll = () => {
  if (
    !navMenu.classList.contains('show-navmenu') &&
    !cartContainer.classList.contains('show-cart-container')
  )
    return;
  navMenu.classList.remove('show-navmenu');
  cartContainer.classList.remove('show-cart-container');
  overlay.classList.remove('show-overlay');
  navToggle.classList.remove('hidden');
};

// cargamos los productos desde el archivo JSON
function loadJSON() {
  fetch('data.json')
    .then((response) => response.json())
    .then((data) => {
      let html = '';
      data.forEach((product) => {
        html += `
                <div class = "product-item">
                    <div class = "product-img">
                        <img src = "${product.imgSrc}" alt = "product image">
                        <button type = "button" class = "add-to-cart-btn">
                            <i class = "fas fa-shopping-cart"></i>Add To Cart
                        </button>
                    </div>
                    <div class = "product-content">
                        <h3 class = "product-name">${product.name}</h3>
                        <span class = "product-category">${product.category}</span>
                        <p class = "product-price">$${product.price}</p>
                    </div>
                </div>
             `;
      });
      productList.innerHTML = html;
    });
}

// compra de producto
function addProduct(e) {
  if (e.target.classList.contains('add-to-cart-btn')) {
    let product = e.target.parentElement.parentElement;
    getProductInfo(product);
  }
}

// traemos la info del producto después de agregarlo al carrito
function getProductInfo(product) {
  let productInfo = {
    id: cartItemID,
    imgSrc: product.querySelector('.product-img img').src,
    name: product.querySelector('.product-name').textContent,

    price: product.querySelector('.product-price').textContent,
  };
  cartItemID++;
  addToCartList(productInfo);
  saveProductInStorage(productInfo);
}

// agregamos el producto selecionado a la lista del carrito
function addToCartList(product) {
  const cartItem = document.createElement('div');
  cartItem.classList.add('cart-item');
  cartItem.setAttribute('data-id', `${product.id}`);
  cartItem.innerHTML = `
        <img src = "${product.imgSrc}" alt = "product image">
        <div class = "cart-item-info">
            <h3 class = "cart-item-name">${product.name}</h3>
            <span class = "cart-item-price">${product.price}</span>
        </div>
        <button type = "button" class = "cart-item-del-btn">
            <i class = "fas fa-times"></i>
        </button>
    `;
  cartList.appendChild(cartItem);
}

// guardamos el producto en el local storage
function saveProductInStorage(item) {
  let products = getProductFromStorage();
  products.push(item);
  localStorage.setItem('products', JSON.stringify(products));
  updateCartInfo();
}

// traemos toda la información de los productos en caso de que haya alguno en el Local Storage
function getProductFromStorage() {
  return localStorage.getItem('products')
    ? JSON.parse(localStorage.getItem('products'))
    : [];
  // retornamos un array vacío en caso que NO haya ningún producto
}

// cargamos el producto del carrito
function loadCart() {
  let products = getProductFromStorage();
  if (products.length < 1) {
    cartItemID = 1; // si no hay ningún producto en el Local Storage
  } else {
    cartItemID = products[products.length - 1].id;
    cartItemID++;
    // traemos el ID del último producto y le sumamos 1
  }
  products.forEach((product) => addToCartList(product));

  // calculamos y actualizamos la interfáz y la información del carrito
  updateCartInfo();
}

// calculamos el precio total del carrito
function findCartInfo() {
  let products = getProductFromStorage();
  let total = products.reduce((acc, product) => {
    let price = parseFloat(product.price.substr(1));
    return (acc += price);
  }, 0); // agregamos todos los precios

  return {
    total: total.toFixed(3),
    productCount: products.length,
  };
}

//  Borramos el producto de la lista del Carrito y del Local Storage
function deleteProduct(e) {
  let cartItem;
  if (e.target.tagName === 'BUTTON') {
    cartItem = e.target.parentElement;
    cartItem.remove(); // se remueve solamente desde el DOM
  } else if (e.target.tagName === 'I') {
    cartItem = e.target.parentElement.parentElement;
    cartItem.remove(); // se remueve solamente desde el DOM
  }

  let products = getProductFromStorage();
  let updatedProducts = products.filter((product) => {
    return product.id !== parseInt(cartItem.dataset.id);
  });
  localStorage.setItem('products', JSON.stringify(updatedProducts)); // actualizamos la lista de productos
  updateCartInfo();
}
