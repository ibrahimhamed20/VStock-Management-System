export class SalesForecastModel {
  // Stub: Generate a simple forecast (e.g., repeat last known sales or random)
  static forecast({ productId: _, startDate, endDate: __, periods = 7 }) {
    // In a real implementation, fetch historical sales and use ML/time-series
    // Here, return a dummy forecast
    const forecast: { date: string; predictedSales: number }[] = [];
    for (let i = 0; i < periods; i++) {
      forecast.push({
        date: new Date(Date.parse(startDate) + i * 86400000)
          .toISOString()
          .slice(0, 10),
        predictedSales: Math.round(100 + Math.random() * 50),
      });
    }
    return forecast;
  }
}
