


const leftHeader = document.querySelector('.header-left');
const smallestDiv = document.querySelector('.smallest');
const smallestH1 = smallestDiv.querySelector('h1');
const smallestP = smallestDiv.querySelector('p');
const avgDiv = document.querySelector('.avg');
const avgH1 = avgDiv.querySelector('h1');
const avgP = avgDiv.querySelector('p');
const maxDiv = document.querySelector('.max');
const maxH1 = maxDiv.querySelector('h1');
const maxP = maxDiv.querySelector('p');


function setColor(element, price){
  element.classList.remove('red');
  element.classList.remove('yellow');
  element.classList.remove('green');
  if(price > 10){
    element.classList.add('red');
  }
  else if(price > 5){
    element.classList.add('yellow');
  }
  else {
    element.classList.add('green');
  }
}


getPrices().then((prices) => {
  const now = new Date();
  const price = getPriceForDate(now, prices['prices']);
  const hoursNow = now.getHours();
  leftHeader.innerHTML = `<h1>${hoursNow}:00 - ${hoursNow+1}:00 ${price} snt/kWh</h1>`;
  setColor(leftHeader, price);
  
  setSmallest(prices['prices']);
  setAvg(prices['prices']);
  setMax(prices['prices']);
});


function setMax(prices){
  const max = prices.reduce((prev, current) => (prev.price > current.price) ? prev : current);
  console.log(max);
  maxH1.innerHTML = `${new Date(max.startDate).getHours()}:00 - ${new Date(max.endDate).getHours()}:00`;
  maxP.innerHTML = `${max.price} snt/kWh`;
  setColor(maxDiv, max.price);
}


function setAvg(prices){
  const avg = prices.reduce((prev, current) => prev + current.price, 0) / prices.length;
  console.log(avg);
  avgH1.innerHTML = `${new Date(prices[0].startDate).getHours()}:00 - ${new Date(prices[prices.length-1].endDate).getHours()}:00`;
  avgP.innerHTML = `${avg} snt/kWh`;
  setColor(avgDiv, avg);
}


function setSmallest(prices){
  const smallest = prices.reduce((prev, current) => (prev.price < current.price) ? prev : current);
  console.log(smallest);
  smallestH1.innerHTML = `${new Date(smallest.startDate).getHours()}:00 - ${new Date(smallest.endDate).getHours()}:00`;
  smallestP.innerHTML = `${smallest.price} snt/kWh`;
  setColor(smallestDiv, smallest.price);
}


async function getPrices(){
  return fetch('http://localhost:3000/prices').then((response) => {
    return response.json();
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