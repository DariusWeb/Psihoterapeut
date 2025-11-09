// src/stores/mainStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

const options = {
  headers: {
    'x-rapidapi-key': import.meta.env.VITE_API_YAHOO_FINANCE_API_KEY,
    'x-rapidapi-host': import.meta.env.VITE_API_RAPID_API_HOST,
  },
};

export const useMainStore = defineStore('main', {
  state: () => ({
    // historicalData: ref(null),
  }),

  getters: {
    // getHistoricalData: (state) => state.historicalData,
  },

  actions: {
    // Load data from localStorage when the store initializes
    // loadFromLocalStorage() {
    //   const storedData = localStorage.getItem('historicalData');
    //   if (storedData) {
    //     this.historicalData = JSON.parse(storedData);
    //   }
    // },

    // Fetch historical data using then/catch
    // fetchHistoricalData() {
    //   if (this.historicalData !== null) {
    //     console.log('Using cached data:', this.historicalData);
    //     return Promise.resolve(this.historicalData);
    //   }

    //   const url = 'https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/history?symbol=BVB.RO&interval=1d&diffandsplits=false';

    //   return fetch(url, options)
    //     .then(response => {
    //       return response.json();
    //     })
    //     .then(result => {
    //       this.setHistoricalData(result);
    //       return result;
    //     })
    // },

    // Set historical data
    // setHistoricalData(data) {
    //   this.historicalData = data;
    //   localStorage.setItem('historicalData', JSON.stringify(this.historicalData));
    // },

    // Initialize store data
    initialize() {
      // this.loadFromLocalStorage();
    },
  },
});
