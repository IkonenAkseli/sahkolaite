


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





function buildChart(prices){

  const xValues = prices.slice(0).reverse().filter(checkIfToday).map((price) => {
    const date = new Date(price.startDate);
    console.log(date);
    return `${date.getHours()}:00`;
  });
  const yValues = prices.slice(0).reverse().filter(checkIfToday).map((price) => price.price);
  const barColors = prices.slice(0).reverse().filter(checkIfToday).map((price) => {
    if(price.price > 10){
      return 'red';
    }
    else if(price.price > 5){
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