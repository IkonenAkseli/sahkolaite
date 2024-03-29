



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
let stashedPrices = null;
let stashedPricesTimestamp = null;


let breakPoint1 = localStorage.getItem('breakPoint1') || 5;
let breakPoint2 = localStorage.getItem('breakPoint2') || 10;
let startHour = localStorage.getItem('startHour') || 0;
let chart = null;
let udpateAt14Success = false;

document.querySelector('#break-point1').value = breakPoint1 || 5;
document.querySelector('#break-point2').value = breakPoint2 || 10;
document.querySelector('#start-hour').value = startHour || 0;


configForm.addEventListener('submit',(event) => {
  event.preventDefault(); 
  breakPoint1 = document.querySelector('#break-point1').value || 5;
  breakPoint2 = document.querySelector('#break-point2').value || 10;
  startHour = document.querySelector('#start-hour').value || 0;
  
  localStorage.setItem('breakPoint1', breakPoint1);
  localStorage.setItem('breakPoint2', breakPoint2);
  localStorage.setItem('startHour', startHour);

  avgDiv.scrollIntoView();

  setTimeout(() => {
    formContainer.classList.add('hidden');
  }, 300);
  toggleDisabled();

  
  refreshPrices();
  return false;
});




configButton.addEventListener('click', () => {
  

  if(formContainer.classList.contains('hidden')){
    setTimeout(() => {
      formContainer.scrollIntoView();
    }, 100);
    formContainer.classList.toggle('hidden');
    toggleDisabled();
    return;
  }
  avgDiv.scrollIntoView();
  toggleDisabled();
  

  setTimeout(() => {
    formContainer.classList.toggle('hidden');
  }, 100);
  
});


function toggleDisabled(){
  const inputs = document.querySelectorAll('input');
  inputs.forEach((input) => {
    input.disabled = !input.disabled;
  });
}


// Set timeout to trigger at the start of the next hour
setTimeout(() => {
  refreshCurrentPrice();
  // Update the price every hour
  setInterval(() => {
    console.log("Updating prices");
    const now = new Date();
    if(now.getHours() == 3 || now.getHours() == 14){
      //console.log("first if")
      refreshPrices();
    }
    else if (now.getHours() == 15 && !udpateAt14Success){
      //console.log("second if");
      refreshPrices();
      udpateAt14Success = false;
    }
    else {
      refreshCurrentPrice();
    }
  }, 1000 * 60 * 60);
}, (60 - new Date().getMinutes()) * 60 * 1000);


function refreshCurrentPrice(){
  getPrices().then((prices) => {
    const now = new Date();
    const price = getPriceForDate(now, prices['prices']);
    const hoursNow = now.getHours();
    leftHeader.innerHTML = `<h1 class="h1-left">${hoursNow}:00 - ${hoursNow+1}:00</h1><h1 class="h1-left">${price} snt/kWh</h1>`;
    setColor(leftHeader, price);
  });
};


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
};


function checkIfToday(date){

  
  date = new Date(date.startDate);

  //console.log(date);
  
  const today = new Date();
  const diff = startHour || 0;
  date.setHours(date.getHours() - 1);
  return date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear();
};

function checkIfTomorrow(date){
  date = new Date(date.startDate);

  const today = new Date();
  const diff = startHour || 0;
  date.setHours(date.getHours() - 1);
  date.setDate(date.getDate() - 1);
  return date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear();
};


function checkForTomorrowPrices(priceObj){
  //console.log("stashed prices", stashedPrices);
  const latestPrice = new Date(priceObj.prices[0].startDate);
  const now = new Date();

  // +2 instead of +1 for oddities in data
  now.setDate(now.getDate() + 2);

  //console.log(latestPrice.getDate(), now.getDate());
  
  if(latestPrice.getDate() === now.getDate()){
      return true;
  }
  return false;
};

/*
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
*/


async function refreshPrices(){
  udpateAt14Success = await getPrices().then((prices) => {
    console.log("updating everything")
    const now = new Date();
    const price = getPriceForDate(now, prices['prices']);
    const hoursNow = now.getHours();
    leftHeader.innerHTML = `<h1 class="h1-left">${hoursNow}:00 - ${hoursNow+1}:00</h1><h1 class="h1-left">${price} snt/kWh</h1>`;
    setColor(leftHeader, price);
    setSmallest(prices['prices']);
    setCheapestWindow(prices['prices']);
    setMax(prices['prices']);

    chart ? updateChart(chart, prices['prices']) : buildChart(prices['prices']);
    return checkForTomorrowPrices(prices);
  });
};


function buildChart(prices){

  const xValues = prices.slice(0).reverse().filter(checkIfToday).map((price) => {
    const date = new Date(price.startDate);
    //console.log(date);
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

  const yValuesTomorrow = prices.slice(0).reverse().filter(checkIfTomorrow).map((price) => price.price);


  chart = new Chart("priceChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues,
        order: 1,
      },{
        backgroundColor: 'blue',
        borderColor: 'lightblue',
        data: yValuesTomorrow,
        type: 'line',
        fill: false,
        order: 0,
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          }
        }]
      },
      legend: {display: false},
      title: {
        display: true,
        text: "Hinnat tänään"
      }
    }
  });

}

function updateChart(chart, prices){
  const xValues = prices.slice(0).reverse().filter(checkIfToday).map((price) => {
    const date = new Date(price.startDate);
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

  chart.data.labels = xValues;
  chart.data.datasets[0].data = yValues;
  chart.data.datasets[0].backgroundColor = barColors;
  chart.update();
};


function setMax(prices){
  const max = prices.filter(checkIfToday).reduce((prev, current) => (prev.price > current.price) ? prev : current);
  //console.log(max);
  maxH1.innerHTML = `${new Date(max.startDate).getHours()}:00 - ${new Date(max.endDate).getHours()}:00`;
  maxP.innerHTML = `${max.price} snt/kWh`;
  setColor(maxDiv, max.price);
};


function setAvg(prices){
  const avg = prices.filter(checkIfToday).reduce((prev, current) => prev + current.price, 0) / prices.length;
  //console.log(avg);
  avgH1.innerHTML = 'Keskiarvo';
  avgP.innerHTML = `${avg.toFixed(3)} snt/kWh`;
  setColor(avgDiv, avg);
};


function setSmallest(prices){
  const smallest = prices.filter(checkIfToday).reduce((prev, current) => (prev.price < current.price) ? prev : current);
  //console.log(smallest);
  smallestH1.innerHTML = `${new Date(smallest.startDate).getHours()}:00 - ${new Date(smallest.endDate).getHours()}:00`;
  smallestP.innerHTML = `${smallest.price} snt/kWh`;
  setColor(smallestDiv, smallest.price);
};



async function getCheapestWindow(prices){
  const pricesToday = await prices.filter(checkIfToday);

  let currentSum = null;
  let startIndex = 0;
  for(let i = 0; i < pricesToday.length - 2; i++){
    const sum = pricesToday[i].price + pricesToday[i+1].price + pricesToday[i+2].price;
    if(currentSum == null || sum < currentSum){
      currentSum = sum;
      startIndex = i;
    }
  };
  return startIndex;
};


async function setCheapestWindow(prices){
  let cheapestWindow = await getCheapestWindow(prices);
  pricesToday = prices.filter(checkIfToday);

  const windowAvg = (pricesToday[cheapestWindow].price + pricesToday[cheapestWindow+1].price + pricesToday[cheapestWindow+2].price) / 3;
  
  avgH1.innerHTML = `${new Date(pricesToday[cheapestWindow+2].startDate).getHours()}:00 - ${new Date(pricesToday[cheapestWindow].endDate).getHours()}:00`;
  avgP.innerHTML = `${windowAvg.toFixed(3)} snt/kWh`;
  setColor(avgDiv, windowAvg);
};



async function getPrices(){
  if (stashedPrices && stashedPricesTimestamp){
    const now = new Date();
    
    if (now.getHours() < 14 || checkForTomorrowPrices(stashedPrices)) {
      console.log("Returning stashed prices");
      return stashedPrices;
    }
  }
  const response = await fetch('/api/prices');
  const prices = await response.json();
  stashedPrices = prices;
  stashedPricesTimestamp = new Date();
  return prices;
  return fetch('/api/prices').then((response) => {
    
    stashedPrices = response.json();
    stashedPricesTimestamp = new Date();
    console.log(stashedPrices);
    return stashedPrices;
  });
};


function getPriceForDate(date, prices) {
  //console.log(prices)
  const matchingPriceEntry = prices.find(
    (price) => new Date(price.startDate) <= date && new Date(price.endDate) > date
  );

  if (!matchingPriceEntry) {
    throw 'Price for the requested date is missing';
  }
  //console.log(matchingPriceEntry);

  return matchingPriceEntry.price;
};

refreshPrices();