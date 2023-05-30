



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
const configForm = document.querySelector('#config-form');
const formContainer = document.querySelector('.form-container');
const configButton = document.querySelector('#setConfig');


let breakPoint1 = localStorage.getItem('breakPoint1') || 5;
let breakPoint2 = localStorage.getItem('breakPoint2') || 10;


configForm.addEventListener('submit',(event) => {
  event.preventDefault(); 
  breakPoint1 = document.querySelector('#break-point1').value || 5;
  breakPoint2 = document.querySelector('#break-point2').value || 10;
  
  localStorage.setItem('breakPoint1', breakPoint1);
  localStorage.setItem('breakPoint2', breakPoint2);

  formContainer.classList.add('hidden');
  refreshPrices();
  return false;
});




configButton.addEventListener('click', () => {
  formContainer.classList.toggle('hidden');
  setTimeout(() => {
    formContainer.scrollIntoView();
  }, 100);
  
});


// Set timeout to trigger at the start of the next hour
setTimeout(() => {
  // Update the price every hour
  setInterval(() => {
    const now = new Date();
    if(now.getHours() == 0){
      refreshPrices();
    }
    getPrices().then((prices) => {
      
      const price = getPriceForDate(now, prices['prices']);
      const hoursNow = now.getHours();
      leftHeader.innerHTML = `<h1>${hoursNow}:00 - ${hoursNow+1}:00 ${price} snt/kWh</h1>`;
      setColor(leftHeader, price);
    });
  }, 1000 * 60 * 60);
}, (60 * 60 * 1000 - new Date().getMinutes()) * 60 * 1000);



function setColor(element, price){
  
  element.classList.remove('red');
  element.classList.remove('yellow');
  element.classList.remove('green');
  if(price > breakPoint2){
    element.classList.add('red');
  }
  else if(price > breakPoint1){
    element.classList.add('yellow');
  }
  else {
    element.classList.add('green');
  }
}


function checkIfToday(date){
  date = new Date(date.startDate);
  
  const today = new Date();
  const diff = today.getTimezoneOffset() / 60;
  date.setHours(date.getHours());
  return date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear();
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
  buildChart(prices['prices']);

});


function refreshPrices(){
  getPrices().then((prices) => {
    const now = new Date();
    const price = getPriceForDate(now, prices['prices']);
    const hoursNow = now.getHours();
    leftHeader.innerHTML = `<h1>${hoursNow}:00 - ${hoursNow+1}:00 ${price} snt/kWh</h1>`;
    setColor(leftHeader, price);
    setSmallest(prices['prices']);
    setAvg(prices['prices']);
    setMax(prices['prices']);
    buildChart(prices['prices']);
  });
}


function buildChart(prices){

  const xValues = prices.slice(0).reverse().filter(checkIfToday).map((price) => {
    const date = new Date(price.startDate);
    console.log(date);
    return `${date.getHours()}:00`;
  });
  const yValues = prices.slice(0).reverse().filter(checkIfToday).map((price) => price.price);
  const barColors = prices.slice(0).reverse().filter(checkIfToday).map((price) => {
    if(price.price > breakPoint2){
      return 'red';
    }
    else if(price.price > breakPoint1){
      return 'yellow';
    }
    else {
      return 'green';
    }
  });




  new Chart("priceChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options: {
      legend: {display: false},
      title: {
        display: true,
        text: "Hinnat tänään"
      }
    }
  });

  


}


function setMax(prices){
  const max = prices.filter(checkIfToday).reduce((prev, current) => (prev.price > current.price) ? prev : current);
  console.log(max);
  maxH1.innerHTML = `${new Date(max.startDate).getHours()}:00 - ${new Date(max.endDate).getHours()}:00`;
  maxP.innerHTML = `${max.price} snt/kWh`;
  setColor(maxDiv, max.price);
}


function setAvg(prices){
  const avg = prices.filter(checkIfToday).reduce((prev, current) => prev + current.price, 0) / prices.length;
  console.log(avg);
  avgH1.innerHTML = 'Keskiarvo';
  avgP.innerHTML = `${avg.toFixed(3)} snt/kWh`;
  setColor(avgDiv, avg);
}


function setSmallest(prices){
  const smallest = prices.filter(checkIfToday).reduce((prev, current) => (prev.price < current.price) ? prev : current);
  console.log(smallest);
  smallestH1.innerHTML = `${new Date(smallest.startDate).getHours()}:00 - ${new Date(smallest.endDate).getHours()}:00`;
  smallestP.innerHTML = `${smallest.price} snt/kWh`;
  setColor(smallestDiv, smallest.price);
}


async function getPrices(){
  return fetch('/api/prices').then((response) => {
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