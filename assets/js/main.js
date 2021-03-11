// let modal = document.getElementById('myModal');
// let btn = document.getElementById('modal');
// let span = document.querySelectorAll('.close')[0];
let firstName = document.getElementById('firstName');
let lastName = document.getElementById('lastName');
let email = document.getElementById('email');
let textarea = document.getElementById('taMessage');
let submit = document.getElementById('submit');
let url = window.location.href.split('/');
let adresa = url[url.length - 1];
console.log(adresa);

// Document ready (jQuery)
$(document).ready(function () {
  checkLocalStorageData();

  $('#searchInput').keyup(filterChange);
  $('#submit').click(getFormValues);
  $('#sort').change(filterChange);
  //Scroll To Top
  $('.scrollTop').on('click', () => {
    window.scrollTo(0, 0);
  });

  $.ajax({
    method: 'get',
    url: 'assets/data/products.json',
    success: function (data) {
      setItemToLocalStorage('products', data);
    },
  });

  //Initially hidden button
  $('.scrollTop').hide(); // Initally hidden
  $(document).scroll(function () {
    if ($(document).scrollTop() > 200) {
      $('.scrollTop').fadeIn();
    } else {
      $('.scrollTop').fadeOut();
    }
  });
});

// Window onload
window.onload = function () {
  ajaxCall('menu', printMenu);

  if (adresa == 'index.html') {
    submit.addEventListener('click', checkForm);
  } else if (adresa == 'cart.html') {
  } else if (adresa == 'store.html') {
    ajaxCall('products', printProducts);

    $.ajax({
      method: 'get',
      url: 'assets/data/models.json',
      success: function (data) {
        createDropDownList(data, 'modelsDDL', 'modelDiv', 'Model');
      },
      error: function (xhr, status, err) {
        console.log(xhr);
        console.log(status);
        console.log(err);
      },
    });

    $.ajax({
      method: 'get',
      url: 'assets/data/category.json',
      success: function (data) {
        createDropDownList(data, 'deviceTypeDDL', 'deviceTypeDiv', 'Device');
      },
      error: function (xhr, status, err) {
        console.log(xhr);
        console.log(status);
        console.log(err);
      },
    });

    // Modal

    // btn.addEventListener('click', function (e) {
    //   e.preventDefault;
    //   modal.style.display = 'block';
    // });
    // span.addEventListener('click', function () {
    //   modal.style.display = 'none';
    // });

    // window.onclick = function (event) {
    //   if (event.target == modal) {
    //     modal.style.display = 'none';
    //   }
    // };
  }
};

// Ajax Call Function
function ajaxCall(fileName, functionName) {
  $.ajax({
    url: `assets/data/${fileName}.json`,
    method: 'get',
    dataType: 'json',
    success: function (data) {
      functionName(data);
    },
    error: function (xhr, status, err) {
      console.log(xhr);
      console.log(status);
      console.log(err);
    },
  });
}
// Function for printing menu
function printMenu(data) {
  html = '';
  console.log(data);

  for (let object of data) {
    html += `
      <li class="navbar-item">
        <a href="${object.href}" class="navbar-link p-3">${object.text}</a>
      </li>  
    `;
  }

  html += `
  <li class="navbar-item">
    <a href="cart.html" class="shopping-cart navbar-link"
      ><i class="fas fa-shopping-cart p-3"></i
    ></a>
    <span id="itemNumber" class="text-white"></span>
  </li>
  `;

  document.getElementById('menu').innerHTML = html;
  onLoadCartNumber();
}
// Function for printing products
function printProducts(data) {
  onLoadCartNumber();
  // data = filterDevice(data);
  data = searchPhone(data);
  data = sort(data);
  data = filterDevice(data);
  data = filterModel(data);
  // console.log(data);
  if (data.length == 0) {
    $('#products').html(`
    <div class=" col-12 no-products d-flex justify-content-center align-items-center mb-3">
    <h3> Required product is not avaliable at the moment! </h3>
    </div>
    `);
  } else {
    html = '';

    for (let obj of data) {
      html += `
    <div class="container col-lg-3 col-md-4 col-xs-12 my-4 ">
      <div class="product">
        <h5 class="text-center">${obj.name}</h5>
        <a href="#" class="modals"><img src="${obj.img}" alt="${obj.name}"/></a>
        <div class="color-holder d-flex justify-content-center">`;
      for (let color of obj.colors) {
        html += `
        <div class="color" style="background-color: ${color}"></div>
      `;
      }
      html += `
        </div class=>
          <hr/>
          <p class="text-center"> Starting price $${obj.price}</p>
          <a href="#" data-id=${obj.id} style="display: block" class="btn btn-primary m-auto add-cart">
            Buy
          </a>  
      </div>
    </div>  
    `;
    }

    document.getElementById('products').innerHTML = html;
  }
  $('.add-cart').click(addToCart);
  // var carts = document.querySelectorAll('.add-cart');
  // console.log(carts);
  // carts.forEach((cart, index) => {
  //   cart.addEventListener('click', (event) => {
  //     // console.log(data[index]);
  //     event.preventDefault();
  //     cartNumbers(data[index]);
  //     totalCost(data[index]);
  //   });
  // });
}

// Local Storage set and get
function setItemToLocalStorage(name, data) {
  localStorage.setItem(name, JSON.stringify(data));
}

function getItemFromLocalStorage(name) {
  return JSON.parse(localStorage.getItem(name));
}

function addToCart(e) {
  e.preventDefault();
  let id = $(this).data('id');
  let productsFromCart = getItemFromLocalStorage('productsCart');

  if (productsFromCart) {
    if (productIsAlreadyInCart()) {
      updateQuantity();
      onLoadCartNumber();
    } else {
      addToLocalStorage();
      onLoadCartNumber();
    }
  } else {
    addFirstItemToLocalStorage();
    onLoadCartNumber();
  }

  // Add First Item To Local Storage
  function addFirstItemToLocalStorage() {
    let products = [];
    products[0] = {
      id: id,
      quantity: 1,
    };

    setItemToLocalStorage('productsCart', products);
  }

  //Function if product is already in local storage
  function productIsAlreadyInCart() {
    return productsFromCart.filter((x) => x.id == id).length;
  }

  //Function updateQuantity
  function updateQuantity() {
    let productsFromLS = getItemFromLocalStorage('productsCart');
    console.log(productsFromLS);
    productsFromLS.forEach((value) => {
      console.log(value);
      if (value.id == id) {
        value.quantity += 1;
      }
    });

    setItemToLocalStorage('productsCart', productsFromLS);
  }

  // Function addToLocalStorage
  function addToLocalStorage() {
    let productsFromLS = getItemFromLocalStorage('productsCart');
    productsFromLS.push({
      id: id,
      quantity: 1,
    });
    setItemToLocalStorage('productsCart', productsFromLS);
  }
}

function onLoadCartNumber() {
  let productNumbers = getItemFromLocalStorage('productsCart');
  if (productNumbers != null) {
    var broj = 0;
    productNumbers.forEach((value) => {
      broj += value.quantity;
    });
    // console.log(broj);
    displayCartData();

    // let numberOfProducts = productNumbers.length;
    document.querySelector('#itemNumber').textContent = broj;
  } else {
    emptyCartData();
  }
}

// Function for displaying on cart html
function displayCartData() {
  var productsFromLS = getItemFromLocalStorage('productsCart');
  var allProducts = getItemFromLocalStorage('products');
  let array = [];

  array = allProducts.filter((p) => {
    for (let prod of productsFromLS) {
      if (p.id == prod.id) {
        p.quantity = prod.quantity;
        return true;
      }
    }
  });
  // console.log(array);

  $('#products-header').html(`
  <div class="col-12 mt-5">
  <div class="row">
    <div class="col-3 border text-center">
      <h3>Product</h3>
    </div>
    <div class="col-3 border text-center">
      <h3>Price</h3>
    </div>
    <div class="col-3 border text-center">
      <h3>Quantity</h3>
    </div>
    <div class="col-3 border text-center">
    <h3>Equals</h3>
    </div>

  </div>
</div>
  `);

  printCartItems(array);
}

//Function for printing cart items
function printCartItems(array) {
  html = '';
  var total = 0;
  for (let obj of array) {
    total += obj.price * obj.quantity;
    console.log(obj);
    html += `
    <div class="col-12">
      <div class="row">
        <div class="col-3 border d-flex justify-content-center align-items-center quantity">
          <i class="far fa-times-circle delete-icon" onclick="return removeFromCart(${
            obj.id
          })"></i>
          <img src="${obj.img}" alt="${obj.name}" class="image-cart">   
          <p class="pt-1"> ${obj.name}<p>      
        </div>
        <div class="col-3 border d-flex justify-content-center align-items-center">
          <h5 class="text-center"> ${obj.price}$ </h5>
        </div>
        <div class="col-3 border d-flex justify-content-center align-items-center quantity">
          <i class="fas fa-arrow-left" onclick="return decreseQuantity(${
            obj.id
          })"></i>
          <h5 class="text-center"> ${obj.quantity} </h5>
          <i class="fas fa-arrow-right" onclick="return increaseQuantity(${
            obj.id
          })"></i>
        </div>
        <div class="col-3 border d-flex justify-content-center align-items-center">
          <h5> ${obj.price * obj.quantity} $ </h5>
        </div>
      </div>
    </div>

    
    `;
  }
  html += `
   <div class="mt-3">
    <h2> Total: ${total} $ </h2>
   </div>
   <div class="row>
   <div class="container">
     <input type="button" id="button-buy" class="btn btn-primary mt-2" value="Buy">
   </div>
 </div>
  `;
  $('#products-cart').html(html);
  $('#button-buy').click(function () {
    alert('Thanks for buying');
    clearCart();
  });
}
function clearCart() {
  localStorage.removeItem('productsCart');
  location.reload();
}

//Empty cart data function
function emptyCartData() {
  $('#products-header').html(
    '<h1 class="mt-3">Your cart is empty. <a href="store.html">Go to shop!</a></h1>'
  );
}

function removeFromCart(id) {
  let products = getItemFromLocalStorage('productsCart');
  let filtered = products.filter((p) => p.id != id);

  setItemToLocalStorage('productsCart', filtered);

  displayCartData();
}

function decreseQuantity(id) {
  let products = getItemFromLocalStorage('productsCart');
  products.forEach((value) => {
    if (value.id == id) {
      value.quantity--;
    }
  });

  setItemToLocalStorage('productsCart', products);
  displayCartData();
}

function increaseQuantity(id) {
  let products = getItemFromLocalStorage('productsCart');
  products.forEach((value) => {
    if (value.id == id) {
      value.quantity++;
    }
  });
  // location.reload();

  setItemToLocalStorage('productsCart', products);
  displayCartData();
}

// Function for creating drop down List
function createDropDownList(data, idList, idBlock, name) {
  var ddl = `
      <select id="${idList}" class="form-control my-4">
        <option value="0"> Choose ${name} </option>
  `;

  for (let obj of data) {
    ddl += `
      <option value="${name == 'Device' ? obj.idCat : obj.idModel}">${
      obj.name
    }</option>
    `;
  }

  ddl += '</select>';

  document.getElementById(idBlock).innerHTML = ddl;
  $('#' + idList).change(filterChange);
}

// Local Storage getting and setting values of form
function getFormValues() {
  let emailV = $('#email').val();
  let firstNameV = $('#firstName').val();
  let lastNameV = $('#lastName').val();
  let textAreaV = $('#taMessage').val();
  setUsersData(emailV, firstNameV, lastNameV, textAreaV);
}
function setUsersData(email, firstName, lastName, textArea) {
  localStorage.setItem('email', email);
  localStorage.setItem('firstName', firstName);
  localStorage.setItem('lastName', lastName);
  localStorage.setItem('textarea', textArea);
}
function checkLocalStorageData() {
  let email = localStorage.getItem('email');
  let firstName = localStorage.getItem('firstName');
  let lastName = localStorage.getItem('lastName');
  let textarea = localStorage.getItem('textarea');
  if (
    email != null &&
    firstName != null &&
    lastName != null &&
    textarea != null
  ) {
    $('#email').val(email);
    $('#firstName').val(firstName);
    $('#lastName').val(lastName);
    $('#taMessage').val(textarea);
  }
}
// Function Sort
function sort(data) {
  const sortType = document.getElementById('sort').value;
  if (sortType == 'nameAsc') {
    return data.sort((a, b) =>
      a.name.toLowerCase().trim() < b.name.toLowerCase().trim() ? 1 : -1
    );
  } else if (sortType == 'nameDesc') {
    return data.sort((a, b) =>
      a.name.toLowerCase().trim() > b.name.toLowerCase().trim() ? 1 : -1
    );
  } else if (sortType == 'priceAsc') {
    return data.sort((a, b) => (a.price > b.price ? 1 : -1));
  } else if (sortType == 'priceDesc') {
    return data.sort((a, b) => (a.price < b.price ? 1 : -1));
  }
  return data;
}
// Filter function
function filterDevice(data) {
  var deviceType = $('#deviceTypeDDL').val();
  var modelType = $('#modelsDDL').val();
  if (deviceType == 0) {
    return data;
  } else if (deviceType == 1) {
    data = data.filter((x) => x.idCat == 1);
  } else if (deviceType == 2) {
    data = data.filter((x) => x.idCat == 2);
  } else if (deviceType == 3) {
    data = data.filter((x) => x.idCat == 3);
  }
  // createDropDownList(data, 'modelsDDL', 'modelDiv', 'Model');
  console.log(data);
  return data;
}
function filterModel(data) {
  var deviceType = $('#deviceTypeDDL').val();
  var modelType = $('#modelsDDL').val();
  for (let obj of data) {
    //console.log(obj.idModel);
    if (modelType == 0) {
      return data;
    } else if (modelType == obj.idModel) {
      // console.log('usao');
      data = data.filter((x) => x.idModel == obj.idModel);
      deviceType = obj.idCat;
    }
  }
  return data;
}
// Seach Filtering
function searchPhone(data) {
  let searchVal = $('#searchInput').val().toLowerCase();
  if (searchVal) {
    return data.filter((el) => {
      return el.name.toLowerCase().indexOf(searchVal) !== -1;
    });
  }
  return data;
}
// Filter Change
function filterChange() {
  ajaxCall('products', printProducts);
}
// Regular Expression
function checkForm() {
  let regExName = /[A-ZĆČŠĐŽ][a-zčćžšđ]{2,12}/;
  let regExEmail = /^[a-zA-Z0-9\.\-]+@[a-zA-Z0-9\.\-]+$/;

  var error = [];
  if (!regExName.test(firstName.value)) {
    error.push('Name is not valid');
    firstName.classList.add('error');
    errorName.style.display = 'block';
  } else {
    firstName.classList.remove('error');
    firstName.classList.add('success');
    errorName.style.display = 'none';
  }

  if (!regExName.test(lastName.value)) {
    error.push('Last name is not valid');
    lastName.classList.add('error');
    errorLastName.style.display = 'block';
  } else {
    lastName.classList.remove('error');
    lastName.classList.add('success');
    errorLastName.style.display = 'none';
  }

  if (!regExEmail.test(email.value)) {
    error.push('Email Not Valid');
    email.classList.add('error');
    errorEmail.style.display = 'block';
  } else {
    email.classList.remove('error');
    email.classList.add('success');
    errorEmail.style.display = 'none';
  }

  if (textarea.value.length < 10) {
    error.push('Textarea not valid');
    textarea.classList.add('error');
    errorTextArea.style.display = 'block';
  } else {
    textarea.classList.remove('error');
    textarea.classList.add('success');
    errorTextArea.style.display = 'none';
  }

  if (error.length == 0) {
    successText.style.display = 'block';
    location.reload();
  }
}
