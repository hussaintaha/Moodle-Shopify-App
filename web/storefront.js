if (window.hasOwnProperty('Shopify') && Shopify.hasOwnProperty('Checkout')) {

  Shopify.Checkout.OrderStatus.addContentBox(
    '<h2>Thank you. Your order has been received.</h2>',
    "<p class='timerDiv'> You will be redirected to <a href=`https://${window.top.Shopify.shop}/apps/moodle-app/pages/my-courses`>My Courses Page</a> within next 11 seconds. </p>"
  )

  var timeleft = 10;
  var downloadTimer = setInterval(function() {
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

} else if (window.hasOwnProperty('Shopify') && window.location.href.includes('/account/register'))  {

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

}