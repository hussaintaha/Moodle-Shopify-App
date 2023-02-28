if (window.hasOwnProperty('Shopify') && Shopify.hasOwnProperty('Checkout')) {

  Shopify.Checkout.OrderStatus.addContentBox(
    '<h2>Thank you. Your order has been received.</h2>',
    "<p class='timerDiv'> You will be redirected to <a href=`https://${window.top.Shopify.shop}/apps/moodle-app/pages/my-courses`>My Courses Page</a> within next 11 seconds. </p>"
  )

  var timeleft = 10;
  var downloadTimer = setInterval(function () {
    if (timeleft <= 0) {
      clearInterval(downloadTimer);
      window.location = `https://${window.top.Shopify.shop}/apps/moodle-app/pages/my-courses`;
    } else {
      const redirectVar1 = 'You will be redirected to ';
      const redirectVar2 = `<a href=https://${window.top.Shopify.shop}/apps/moodle-app/pages/my-courses>My Courses Page</a> `;
      const redirectVar3 = `within next ${timeleft} seconds.`

      document.querySelector(".timerDiv").innerHTML = `${redirectVar1 + redirectVar2 + redirectVar3}`;

    }
    timeleft -= 1;
  }, 1000);

} else if (window.hasOwnProperty('Shopify') && window.location.href.includes('/account/register')) {

  const getForm = document.querySelector('#create_customer');
  const getFirstName = document.querySelector('#RegisterForm-FirstName');
  const getLastName = document.querySelector('#RegisterForm-LastName');
  const getEmail = document.querySelector('#RegisterForm-email');

  getForm.addEventListener('submit', () => {

    fetch(`https://${window.top.Shopify.shop}/apps/moodle-app/api/route/testing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerFirstName: getFirstName.value,
        customerLastName: getLastName.value,
        customerEmail: getEmail.value,
      })
    })
      .then(response => response.json());
  });

} else if (window.hasOwnProperty('Shopify') && window.location.href.includes('/products')) {


  fetch(`https://${window.top.Shopify.shop}/apps/moodle-app/api/user/enrolled`).then(function (response) {
    return response.json();
  })
    .then((data) => {

      const arr = data.data;

      let getCourseName = arr.map(function (element) {
        return `${element.productName}`;
      });

      let getCourseId = arr.map(function (element) {
        return `${element.productId}`;
      });

      for (let i = 0; i < getCourseName.length; i++) {

        let productTitle = document.querySelector('.product__title');
        productTitle = productTitle.innerText;

        if (productTitle == getCourseName[i]) {

          const parentElement = document.querySelector('.product-form');
          const hideContent1 = document.querySelector('.product-form__submit');
          const hideContent2 = document.querySelector('.shopify-cleanslate');
          const hideContent3 = document.querySelector('.shopify-payment-button__button');
          const hideContent4 = document.querySelector('.shopify-payment-button__more-options');
          const hideContent5 = document.querySelector('.product-form__input');

          let viewCourseBtn = document.createElement('button');
          viewCourseBtn.textContent = 'View Course on Moodle';

          viewCourseBtn.classList.add("product-form__submit");
          viewCourseBtn.classList.add("button");
          viewCourseBtn.classList.add("button--full-width");
          viewCourseBtn.classList.add("button--secondary");
          viewCourseBtn.classList.add("custombutton");

          parentElement.appendChild(viewCourseBtn);

          hideContent1.style.display = "none";
          hideContent2.style.display = "none";
          hideContent3.style.display = "none";
          hideContent4.style.display = "none";
          hideContent5.style.display = "none";

          viewCourseBtn.addEventListener('click', () => {
            window.open(`/apps/moodle-app/api/storefront/mdl_course_id?mdl_course_id=${getCourseId[i]}`, '_blank')
          })

        }
      }
    });
} else if (window.hasOwnProperty('Shopify') && window.location.href.includes('/pages/all-collection')) {

  let totalPrice = 0;
  let check;

  // $(document).ready(function () {

  //   $('[name="parentcheckboxx"]').prop('checked', true);
  //   $('[name="checkboxx"]').prop('checked', true);
  //   check = $('[name="checkboxx"]:checkbox:checked').length;
  //   const totalCourseSelected = $('.heading-courser-selected').children();

  //   $(totalCourseSelected).text(`${check} Courses Selected.`);

  //   let totalChecked = $('[name=checkboxx]:checkbox:checked');
  //   let getPriceofChecked = totalChecked.closest('.grid__item');

  //   getPriceofChecked.each(function () {

  //     let productPrice = $(this)[0].getAttribute("data-product_price");
  //     productPrice = Number(productPrice) / 100;

  //     totalPrice = totalPrice + productPrice;
  //   });

  //   $(".custom-total-price h2").text(`Total = ₱${totalPrice}.00`);
  // });




  var select = new SlimSelect({
    select: '#collections-filters-2',
    settings: {
      showSearch: false,
      placeholderText: 'Select all that apply',
      hideSelected: true,
    }
  });




  function calculateTotal() {
    let total_courses = $('.my-custom-tb input[type="checkbox"]:checked').length
    // console.log('total_courses', total_courses)
    let total_price = 0
    $('.my-custom-tb input[type="checkbox"]:checked').each(function (index, element) {
      $checkbox_element = $(element)
      $parent_li = $checkbox_element.closest('.grid__item')
      $product_price = $parent_li.attr('data-product_price')
      total_price += parseInt($product_price)
    })
    const actual_total = total_price / 100;

    $(".totalCourseSelected").text(`${total_courses} Courses Selected.`);
    $(".custom-total-price h2").text(`Total = ₱${actual_total}.00`);
  }



  // Individual Checkboxes Start

  let totalChecked = $('[name=checkboxx]:checkbox:checked');
  let getPriceofChecked = totalChecked.closest('.grid__item');
  $('[name=checkboxx]').on('click', function () {

    totalChecked = $('[name=checkboxx]:checkbox:checked');
    getPriceofChecked = totalChecked.closest('.grid__item');

    totalPrice = 0;

    for (let z = 0; z < getPriceofChecked.length; z++) {
      let productPrice = getPriceofChecked[z].getAttribute("data-product_price");

      productPrice = Number(productPrice) / 100;
      totalPrice = totalPrice + productPrice;
    }

    // if ($(this).prop('checked')) {

    //   totalChecked = $('[name=checkboxx]:checkbox:checked');
    //   totalPrice = 0;

    //   getPriceofChecked = totalChecked.closest('.grid__item');

    //   for (let z = 0; z < getPriceofChecked.length; z++) {
    //     let productPrice = getPriceofChecked[z].getAttribute("data-product_price");

    //     productPrice = Number(productPrice) / 100;
    //     totalPrice = totalPrice + productPrice;
    //   }


    // } else {

    //   // totalPrice = 0;
    //   // for (let z = 0; z < getPriceofChecked.length; z++) {
    //   //   let productPrice = getPriceofChecked[z].getAttribute("data-product_price");

    //   //   productPrice = Number(productPrice) / 100;
    //   //   totalPrice = totalPrice - productPrice;
    //   // }

    //   let productPrice = getPriceofChecked[0].getAttribute("data-product_price");
    //   productPrice = Number(productPrice) / 100;

    //   totalPrice = totalPrice - productPrice;
    // }


    check = $('[name="checkboxx"]:checkbox:checked').length;
    const totalCourseSelected = $('.heading-courser-selected').children();
    $(totalCourseSelected).text(`${check} Courses Selected.`);

    $(".custom-total-price h2").text(`Total = ₱${totalPrice}.00`);

  });

  // Individual Checkboxes End

  // Parent Checkboxes Start

  $('[name="parentcheckboxx"]').on('click', function () {
    $the_parent_checkbox = $(this);
    $the_parent_checkbox_is_checked = $the_parent_checkbox.is(':checked')
    $the_parent_checkbox_head = $the_parent_checkbox.closest('.custom-top-head')
    $the_parent_checkbox_head_handle = $the_parent_checkbox_head.attr('data-collection-head')
    $('[data-collection-tab="' + $the_parent_checkbox_head_handle + '"] input[type="checkbox"]').attr('checked', $the_parent_checkbox_is_checked)
    calculateTotal();
  });

  // Parent Checkboxes End


  // Filter Start

  $('.courses-btn').on('click', function () {

    $('[name="checkboxx"]').prop('checked', false);
    totalPrice = 0;
    let filterDiv;
    let subFilterDiv = '';

    var values = select.getSelected() // Will return an array of strings

    for (let p = 0; p < values.length; p++) {
      subFilterDiv += ` ${values[p]},`;
    }

    var conceptName = $('#collections-filters-1').find(":selected").val();
    const parentCheckboxes = document.querySelectorAll('[name="parentcheckboxx"]');

    if (conceptName === 'Business') {

      filterDiv = 'Business';

      let filterData = $('li[data-filter_tags*="career-goal_business"]');
      let checkBoxes = filterData.find('[name="checkboxx"]');
      checkBoxes.prop('checked', true);

      parentCheckboxes[0].checked = true;
      parentCheckboxes[3].checked = true;
      parentCheckboxes[4].checked = true;

      const filterValues = $(".ss-values").children();

      for (let m = 0; m < filterValues.length; m++) {

        if (filterValues[m].innerText === 'No Experience') {

        } else if (filterValues[m].innerText === 'Engineer') {

          let excludeCourses = $('li[data-filter_tags*="current-skill-level_engineer"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'PV Design Certified') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_pv-design-certified"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'PV Installation Certified') {

          let excludeCourses = $('li[data-filter_tags*="current-skill-level_pv-installation-certified"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'Solar Seminars') {

          let excludeCourses = $('li[data-filter_tags*="current-skill-level_solar-seminars"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        }
      }

    } else if (conceptName === 'Design') {

      filterDiv = 'Design';

      let filterData = $('li[data-filter_tags*="career-goal_design"]');

      let checkBoxes = filterData.find('[name="checkboxx"]');
      checkBoxes.prop('checked', true);

      parentCheckboxes[0].checked = true;
      parentCheckboxes[1].checked = true;
      parentCheckboxes[3].checked = true;
      parentCheckboxes[4].checked = true;
      parentCheckboxes[5].checked = true;

      const filterValues = $(".ss-values").children();

      for (let m = 0; m < filterValues.length; m++) {

        if (filterValues[m].innerText === 'No Experience') {

        } else if (filterValues[m].innerText === 'Engineer') {

          let excludeCourses = $('li[data-filter_tags*="current-skill-level_engineer"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'PV Design Certified') {

          let excludeCourses = $('li[data-filter_tags*="current-skill-level_pv-design-certified"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'PV Installation Certified') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_pv-installation-certified"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'Solar Seminars') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_solar-seminars"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        }
      }

    } else if (conceptName === 'Install') {

      filterDiv = 'Install';

      let filterData = $('li[data-filter_tags*="career-goal_install"]');

      let checkBoxes = filterData.find('[name="checkboxx"]');
      checkBoxes.prop('checked', true);

      parentCheckboxes[0].checked = true;
      parentCheckboxes[2].checked = true;
      parentCheckboxes[3].checked = true;
      parentCheckboxes[4].checked = true;

      const filterValues = $(".ss-values").children();

      for (let m = 0; m < filterValues.length; m++) {

        if (filterValues[m].innerText === 'No Experience') {


        } else if (filterValues[m].innerText === 'Engineer') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_engineer"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'PV Design Certified') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_pv-design-certified"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'PV Installation Certified') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_pv-installation-certified"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'Solar Seminars') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_solar-seminars"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        }
      }

    } else if (conceptName === 'Operation and Maintenance') {

      filterDiv = 'Operation and Maintenance';

      let filterData = $('li[data-filter_tags*="career-goal_operation"]');

      let checkBoxes = filterData.find('[name="checkboxx"]');
      checkBoxes.prop('checked', true);

      parentCheckboxes[0].checked = true;
      parentCheckboxes[3].checked = true;

      const filterValues = $(".ss-values").children();

      for (let m = 0; m < filterValues.length; m++) {

        if (filterValues[m].innerText === 'No Experience') {


        } else if (filterValues[m].innerText === 'Engineer') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_engineer"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'PV Design Certified') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_pv-design-certified"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'PV Installation Certified') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_pv-installation-certified"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'Solar Seminars') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_solar-seminars"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        }
      }

    } else if (conceptName === 'Basics') {

      filterDiv = 'Basics';

      let filterData = $('li[data-filter_tags*="career-goal_basics"]');

      let checkBoxes = filterData.find('[name="checkboxx"]');
      checkBoxes.prop('checked', true);

      parentCheckboxes[0].checked = true;

      const filterValues = $(".ss-values").children();

      for (let m = 0; m < filterValues.length; m++) {

        if (filterValues[m].innerText === 'No Experience') {


        } else if (filterValues[m].innerText === 'Engineer') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_engineer"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'PV Design Certified') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_pv-design-certified"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'PV Installation Certified') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_pv-installation-certified"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        } else if (filterValues[m].innerText === 'Solar Seminars') {


          let excludeCourses = $('li[data-filter_tags*="current-skill-level_solar-seminars"]');
          let uncheckCourses = excludeCourses.find('[name="checkboxx"]');
          uncheckCourses.prop('checked', false);

        }
      }
    }

    let totalChecked = $('[name=checkboxx]:checkbox:checked');
    let getPriceofChecked = totalChecked.closest('.grid__item');

    getPriceofChecked.each(function () {

      let productPrice = $(this)[0].getAttribute("data-product_price");
      productPrice = Number(productPrice) / 100;

      totalPrice = totalPrice + productPrice;
    });

    check = $('[name="checkboxx"]:checkbox:checked').length;
    totalCourseSelected = $('.heading-courser-selected').children();
    $(totalCourseSelected).text(`${check} Courses Selected.`);

    $(".totalFilterSelected").text(`Filter: ${filterDiv + " /" + subFilterDiv}`)

    $(".custom-total-price h2").text(`Total = ₱${totalPrice}.00`);

    calculateTotal();

  })

  // Filter End


  // Checkout Start

  // $('.custom-checkout-btn').on('click', function () {
  $('.cart__checkout-button').on('click', function (e) {

    e.preventDefault();

    check = $('[name="checkboxx"]:checkbox:checked').length;

    if (check === 0) {
      return
    } else {

      fetch(`https://${window.Shopify.shop}/cart.json`, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {

          const qty = 0;
          let removeItems = { updates: {} };

          for (let j = 0; j < data.items.length; j++) {
            removeItems.updates[data.items[j].id] = qty;
          }

          fetch(`https://${window.Shopify.shop}/cart/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(removeItems)
          })
            .then((response) => {
              if (response.ok) {
                // console.log("RESPONSE", response);
                let items = [];

                for (let i = 0; i < check; i++) {

                  let totalCourses = $('[name="checkboxx"]:checked');

                  let getVariantId = totalCourses.closest('.grid__item')[i];
                  getVariantId = getVariantId.dataset.first_available_variant;

                  items.push({
                    id: getVariantId,
                    quantity: 1
                  })
                }

                fetch(`https://${window.Shopify.shop}/cart/add`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    items: items
                  })
                })
                  .then((response) => {
                    if (response.ok) {
                      window.location.replace(`https://${window.Shopify.shop}/checkout`);
                    }
                  })
                  .catch((error) => console.error("error", error));
              }
            })
            .catch((error) => console.error("error", error));
        })
    }
  });

  // Checkout End

  // Reset Start

  $('.custom-reset-btn').on('click', function () {

    document.getElementById("collections-filters-1").selectedIndex = 0;
    select.setSelected([]);
    subFilterDiv = '';

    $(".totalFilterSelected").text(`${subFilterDiv}`)

  })

  // Reset End

}



// $('.product-form__submit').click(function () {
//   $(this).prop("disabled", true);
// });

// let current_product = $(".product").attr('data-product') 
// let cart_items = $(".product").attr('data-cart');
// let check_if_product_inCart = cart_items.includes(current_product);

// if (check_if_product_inCart === true) {
//   $('.product-form__submit').prop("disabled", true);
// }