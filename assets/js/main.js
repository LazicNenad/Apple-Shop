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

// Document ready (jQuery)
$(document).ready(function () {
  checkLocalStorageData();
  onLoadCartNumber();
  $('#searchInput').keyup(filterChange);
  $('#submit').click(getFormValues);
  $('#sort').change(filterChange);
  //Scroll To Top
  $('.scrollTop').on('click', () => {
    window.scrollTo(0, 0);
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
}
// Function for printing products
function printProducts(data) {
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
    <div class="container col-lg-3 col-md-4 col-xs-12 my-4">
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
        </div>
          <hr/>
          <p class="text-center"> Starting price $${obj.price}</p>
          <a href="#" style="display: block" class="btn btn-primary m-auto add-cart">
            Buy
          </a>  
      </div>
    </div>  
    `;
    }

    document.getElementById('products').innerHTML = html;
  }
  var carts = document.querySelectorAll('.add-cart');
  console.log(carts);
  carts.forEach((cart, index) => {
    cart.addEventListener('click', (event) => {
      // console.log(data[index]);
      event.preventDefault();
      cartNumbers(data[index]);
      totalCost(data[index]);
    });
  });
}
// Function Cart Number
function cartNumbers(product) {
  // console.log(product);
  let productNumbers = localStorage.getItem('cartNumbers');
  productNumbers = parseInt(productNumbers);
  if (productNumbers) {
    localStorage.setItem('cartNumbers', productNumbers + 1);
    document.querySelector('#itemNumber').textContent = productNumbers + 1;
  } else {
    localStorage.setItem('cartNumbers', 1);
    document.querySelector('#itemNumber').textContent = '1';
  }

  setItems(product);
}
//Function setItems
function setItems(product) {
  let cartItems = localStorage.getItem('productsInCart');
  cartItems = JSON.parse(cartItems);

  if (cartItems != null) {
    if (cartItems[product.name] == undefined) {
      cartItems = {
        ...cartItems,
        [product.name]: product,
      };
    }

    cartItems[product.name].inCart += 1;
  } else {
    product.inCart = 1;
    cartItems = {
      [product.name]: product,
    };
  }
  console.log(cartItems);

  localStorage.setItem('productsInCart', JSON.stringify(cartItems));
}
// Function totalCost
function totalCost(product) {
  let cartCost = localStorage.getItem('totalCost');

  console.log(cartCost, typeof cartCost);

  if (cartCost != null) {
    cartCost = parseInt(cartCost);
    localStorage.setItem('totalCost', cartCost + product.price);
  } else {
    localStorage.setItem('totalCost', product.price);
  }
}

function displayCart() {
  let cartItems = localStorage.getItem('productsInCart');
  cartItems = JSON.parse(cartItems);
  console.log(cartItems);
  let productContainer = document.querySelector('#products');
  console.log(productContainer);
  if (cartItems && productContainer) {
    html = '';
    Object.values(cartItems).map((item) => {
      html += `
        <div class="col-6  border-left border-right border-bottom product"> 
          <i class="far fa-times-circle"></i>
          <img src="${item.img}">
          <span> ${item.name} </span>
        </div>
        <div class="col-3 border-left border-right border-bottom product d-flex justify-content-center align-items-center">
          <p> ${item.price} $</p>
        </div>
        <div class="col-3 border-left border-right border-bottom d-flex justify-content-center align-items-center product">
        <i class="fas fa-arrow-left p-4"></i>
          ${item.inCart}
          <i class="fas fa-arrow-right p-4"></i>
        </div>
        
      `;
    });

    html += `
    <h3 class="mt-5 text-left">Total: ${localStorage.getItem(
      'totalCost'
    )} $</h3>
    `;
  }
  productContainer.innerHTML = html;
}

function onLoadCartNumber() {
  let productNumbers = localStorage.getItem('cartNumbers');

  if (productNumbers) {
    document.querySelector('#itemNumber').textContent = productNumbers;
  }
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
      console.log('usao');
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
    console.log('good');
    firstName.classList.remove('error');
    firstName.classList.add('success');
    errorName.style.display = 'none';
  }

  if (!regExName.test(lastName.value)) {
    error.push('Last name is not valid');
    lastName.classList.add('text-danger');
    errorLastName.style.display = 'block';
  } else {
    lastName.classList.remove('text-danger');
    lastName.classList.add('success');
    errorLastName.style.display = 'none';
  }

  if (!regExEmail.test(email.value)) {
    error.push('Email Not Valid');
    email.classList.add('text-danger');
    errorEmail.style.display = 'block';
  } else {
    email.classList.remove('text-danger');
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

displayCart();
