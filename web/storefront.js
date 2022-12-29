const getForm = document.querySelector('#create_customer');
const getFirstName = document.querySelector('#RegisterForm-FirstName');
const getLastName = document.querySelector('#RegisterForm-LastName');
const getEmail = document.querySelector('#RegisterForm-email');
const getPassword = document.querySelector('#RegisterForm-password');

if (window.hasOwnProperty('Shopify') && Shopify.hasOwnProperty('Checkout')) {

  Shopify.Checkout.OrderStatus.addContentBox(
    '<h2>Thank you. Your order has been received.</h2>',
    "<p class='timerDiv'> You will be redirected to <a href='https://gses-dev.myshopify.com/apps/moodle-app/pages/my-courses'>My Courses Page</a> within next 11 seconds. </p>"
  )

  var timeleft = 10;
  var downloadTimer = setInterval(function(){
    if(timeleft <= 0){
      clearInterval(downloadTimer);
      window.location = "https://gses-dev.myshopify.com/apps/moodle-app/pages/my-courses";
    } else {
      document.querySelector(".timerDiv").innerHTML =`You will be redirected to <a href='https://gses-dev.myshopify.com/apps/moodle-app/pages/my-courses'>My Courses Page</a> within next ${timeleft} seconds.`;
    }
    timeleft -= 1;
  }, 1000);

} else {

    getForm.addEventListener('submit', () => {

      fetch('https://gses-dev.myshopify.com/apps/moodle-app/api/route/testing', {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              customerFirstName  : getFirstName.value,
              customerLastName   : getLastName.value,
              customerEmail      : getEmail.value,
              customerPassword   : getPassword.value,
          })
      })
      .then(response => response.json());
  });

}
