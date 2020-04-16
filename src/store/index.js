import Vue from 'vue'
import Vuex from 'vuex'
import { httpRequest } from "@/utils/";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    india: {
      objects: {},
      table: [],
      max: 0
    },
    states: {
      tamilnadu: {
        objects: {},
        table: [],
        max: 0
      }
    },
    cities: {
      chennai: {
        objects: {},
        table: [],
        max: 0
      }
    }
  },
  mutations: {
    setState(state, region) {
      state.states[region.name] = region.data
    },
    setCountry(state, country) {
      state[country.name] = country.data
    },
    setCity(state, city) {
      state.cities[city.name] = city.data
    }
  },
  actions: {
    getData(context) {
      if (context.state.india.table.length == 0) {
        httpRequest({ url: "https://api.covid19india.org/data.json" })
          .then(response => {
            var objects = {};
            var table = []
            var max = 0;
            for (var i in response.statewise) {
              var obj = response.statewise[i]
              var obj = {
                name: obj.state,
                key: obj.state.lowerize(),
                active: parseInt(obj.active),
                confirmed: parseInt(obj.confirmed),
                recovered: parseInt(obj.recovered),
                deaths: parseInt(obj.deaths),
                deltaactive: parseInt(obj.deltaactive),
                deltaconfirmed: parseInt(obj.deltaconfirmed),
                deltarecovered: parseInt(obj.deltarecovered),
                deltadeaths: parseInt(obj.deltadeaths)
              }
              obj.deltaactive=obj.deltaconfirmed
              objects[obj.key] = obj;
              table.push(obj);
              if (obj.active > max && obj.name !== "Total") {
                max = obj.active;
              }
            }
            context.commit('setCountry', {
              name: "india",
              data: {
                objects: objects,
                table: table,
                max: max
              }
            })
          })
          .catch(err => {
            console.log(err);
          });
      }
      if (context.state.states.tamilnadu.table.length == 0) {
        httpRequest({ url: "https://api.covid19india.org/v2/state_district_wise.json" })
          .then(response => {

            for (var stateI in response) {
              var total = {
                name: "Total",
                key: "total",
                active: 0,
                confirmed: 0,
                recovered: null,
                deaths: null,
                deltaactive: 0,
                deltaconfirmed: 0,
                deltarecovered: null,
                deltadeaths: null
              }
              var objects = {};
              var table = []
              var max = 0;
              for (var disI in response[stateI].districtData) {
                var obj = response[stateI].districtData[disI];
                var obj = {
                  name: obj.district,
                  key: obj.district.lowerize(),
                  active: null,
                  confirmed: obj.confirmed,
                  recovered: null,
                  deaths: null,
                  deltaactive: null,
                  deltaconfirmed: obj.delta.confirmed,
                  deltarecovered: null,
                  deltadeaths: null
                }
                obj.active=obj.confirmed
                objects[obj.key] = obj;
                table.push(obj);
                if (obj.confirmed > max && obj.name !== "Total") {
                  max = obj.confirmed;
                }
                total.active+=obj.active
                total.confirmed += obj.confirmed
                total.deltaconfirmed += obj.deltaconfirmed
              }
              objects[total.key] = total;
              table.push(total);
              context.commit('setState', {
                name: response[stateI].state.lowerize(),
                data: {
                  objects: objects,
                  table: table,
                  max: max
                }
              })
            }

          })
          .catch(err => {
            console.log(err);
          });
      }
      if (context.state.cities.chennai.table.length == 0) {
        httpRequest({ url: process.env.BASE_URL + "api/chennai.json" })
          .then(response => {
            var objects = {};
            var table = []
            var max = 0;
            var total = {
              name: "Total",
              key: "total",
              active: 0,
              confirmed: 0,
              recovered: 0,
              deaths: 0,
              deltaactive: 0,
              deltaconfirmed: 0,
              deltarecovered: 0,
              deltadeaths: 0
            }
            for (var i in response) {
              var obj = response[i]
              obj.key = obj.zone.lowerize();
              objects[obj.key] = obj;
              table.push(obj);
              if (obj.confirmed > max && obj.name !== "Total") {
                max = obj.confirmed;
              }
              total.active +=obj.active
              total.deltaactive +=obj.deltaactive
              total.recovered +=obj.recovered
              total.deltarecovered +=obj.deltarecovered
              total.deaths +=obj.deaths
              total.deltadeaths +=obj.deltadeaths
              total.confirmed += obj.confirmed
              total.deltaconfirmed += obj.deltaconfirmed
            }
            objects[total.key] = total;
            table.push(total);
            context.commit('setCity', {
              name: "chennai",
              data: {
                objects: objects,
                table: table,
                max: max
              }
            })
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
  },
  modules: {
  }
})
