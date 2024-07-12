import { readFileSync } from 'fs';


function readData(filePath) {
  try {
    const data = readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
    return [];
  }
}

function generateReports(data) {
  let totalSales = 0;
  let monthWiseSales = {};
  let popularItems = {};
  let revenueItems = {};

  data.forEach(item => {
    let date = new Date(item.Date);
    let month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    totalSales += item['Total Price'];

    if (!monthWiseSales[month]) {
      monthWiseSales[month] = 0;
    }
    monthWiseSales[month] += item['Total Price'];

    if (!popularItems[month]) {
      popularItems[month] = {};
    }
    if (!popularItems[month][item.SKU]) {
      popularItems[month][item.SKU] = 0;
    }
    popularItems[month][item.SKU] += item.Quantity;

    if (!revenueItems[month]) {
      revenueItems[month] = {};
    }
    if (!revenueItems[month][item.SKU]) {
      revenueItems[month][item.SKU] = 0;
    }
    revenueItems[month][item.SKU] += item['Total Price'];
  });

  let mostPopularItems = {};
  let mostRevenueItems = {};
  let popularItemStats = {};

  for (let month in popularItems) {
    let maxQuantity = 0;
    let popularItem = '';
    for (let item in popularItems[month]) {
      if (popularItems[month][item] > maxQuantity) {
        maxQuantity = popularItems[month][item];
        popularItem = item;
      }
    }
    mostPopularItems[month] = popularItem;

    if (!popularItemStats[month]) {
      popularItemStats[month] = [];
    }
    data.forEach(item => {
      if (item.SKU === popularItem && new Date(item.Date).getMonth() === new Date(month + '-01').getMonth()) {
        popularItemStats[month].push(item.Quantity);
      }
    });

    let minOrders = Math.min(...popularItemStats[month]);
    let maxOrders = Math.max(...popularItemStats[month]);
    let avgOrders = popularItemStats[month].reduce((a, b) => a + b, 0) / popularItemStats[month].length;
    popularItemStats[month] = { min: minOrders, max: maxOrders, avg: avgOrders };
  }

  for (let month in revenueItems) {
    let maxRevenue = 0;
    let revenueItem = '';
    for (let item in revenueItems[month]) {
      if (revenueItems[month][item] > maxRevenue) {
        maxRevenue = revenueItems[month][item];
        revenueItem = item;
      }
    }
    mostRevenueItems[month] = revenueItem;
  }

  console.log('Total sales of the store:', totalSales);
  console.log('Month wise sales totals:', monthWiseSales);
  console.log('Most popular item in each month:', mostPopularItems);
  console.log('Items generating most revenue in each month:', mostRevenueItems);
  console.log('Most popular item statistics (min, max, avg orders each month):', popularItemStats);
}

const salesData = readData('salesData.json');

generateReports(salesData);
