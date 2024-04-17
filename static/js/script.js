function closeAllDescriptions() {
  document.querySelectorAll('.company-description').forEach(desc => {
    desc.style.display = 'none';
  });
}

function addToCart(productId) {
  const product = document.getElementById(productId);
  if (!product) {
    console.error(`Product with ID ${productId} not found.`);
    return;
  }

  const productName = product.querySelector('h3') ? product.querySelector('h3').textContent : 'Unknown Product';
  const productPrice = product.querySelector('p').textContent.split('Price: ')[1];
  const productImageSrc = product.querySelector('img').src;
  const productInfo = product.querySelector('.product-info p') ? product.querySelector('.product-info p').textContent : '';
  const productImage = productImageSrc.startsWith('http') ? productImageSrc : window.location.origin + '/static/css/' + productImageSrc;

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingProductIndex = cart.findIndex(p => p.name === productName);

  if (existingProductIndex !== -1) {
    cart[existingProductIndex].quantity += 1;
  } else {
    cart.push({
      name: productName,
      price: parseFloat(productPrice),
      image: productImage,
      info: productInfo,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${productName} added to cart.`);
  displayCart();
}

// Function to calculate the total price of the cart
function calculateTotal() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Function to display the cart
function displayCart() {
  const cartContainer = document.getElementById('cartItems');
  cartContainer.innerHTML = ''; 

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length > 0) {
    cart.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('cart-item');
      itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" style="width:100px; height:auto;">
        <div class="item-details">
          <h3>${item.name}</h3>
          <p>Quantity: ${item.quantity}</p>
          <p>Price: ${item.price * item.quantity}</p> <!-- Total price for the item -->
        </div>
      `;
      cartContainer.appendChild(itemElement);
    });

    const totalPriceElement = document.createElement('div');
    totalPriceElement.classList.add('total-price');
    totalPriceElement.innerHTML = `<h2>Total Price: ${calculateTotal()}</h2>`;
    cartContainer.appendChild(totalPriceElement);
  } else {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
  }
}


document.addEventListener('DOMContentLoaded', () => {
  closeAllDescriptions();

  const blocks = document.querySelectorAll('.section-block');
  blocks.forEach(block => {
    block.addEventListener('mouseenter', () => {
      closeAllDescriptions();
      block.querySelector('.company-description').style.display = 'block';
    });
  });

  const clearCartBtn = document.getElementById('clearCart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      localStorage.removeItem('cart');
      displayCart();
    });
  }

  displayCart();
});

function logoutUser() {
  localStorage.removeItem('cart');  
  window.location.href = '/home'; 
}

function checkout() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const deliveryTime = document.getElementById('timePicker').value;

  
  const filteredCart = cart.map(item => ({
    name: item.name,
    quantity: item.quantity
  }));

  if (filteredCart.length > 0 && deliveryTime) {
    fetch('/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cart: filteredCart, deliveryTime }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Order placed successfully');
        localStorage.removeItem('cart'); 
        window.location.href = '/welcome'; 
      } else {
        alert('Failed to place order');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  } else {
    alert('Your cart is empty or delivery time is not selected.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.getElementById('copyright');
  const currentYear = new Date().getFullYear();
  yearElement.textContent = '\u00A9 ' + currentYear;
});
