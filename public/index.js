


const leftHeader = document.querySelector('.header-left');



getPrices().then((prices) => {
  const now = new Date();
  const price = getPriceForDate(now, prices['prices']);
  leftHeader.innerHTML = `<h1>${now.getHours()}:00 ${price} snt/kWh</h1>`;
  leftHeader.classList.remove('red');
  leftHeader.classList.remove('yellow');
  leftHeader.classList.remove('green');
  if(price > 10){
    leftHeader.classList.add('red');
  }
  else if(price > 5){
    leftHeader.classList.add('yellow');
  }
  else {
    leftHeader.classList.add('green');
  }
    
});



async function getPrices(){
  return fetch('http://localhost:3000/prices').then((response) => {
    return response.json()
  });
}


function getPriceForDate(date, prices) {
  console.log(prices)
  const matchingPriceEntry = prices.find(
    (price) => new Date(price.startDate) <= date && new Date(price.endDate) > date
  );

  if (!matchingPriceEntry) {
    throw 'Price for the requested date is missing';
  }
  console.log(matchingPriceEntry);

  return matchingPriceEntry.price;
}