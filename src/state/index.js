import { httpRequest } from "@/utils/";

var state = {
  india: {
    objects: {},
    max: 0,
    daily: null
  }
}


var utils = {
  stateMap: {
    "an": "andamanandnicobarislands",
    "ap": "andhrapradesh",
    "ar": "arunachalpradesh",
    "as": "assam",
    "br": "bihar",
    "ch": "chandigarh",
    "ct": "chhattisgarh",
    "dd": "dadraandnagarhaveli",
    "dl": "delhi",
    "dn": "damananddiu",
    "ga": "goa",
    "gj": "gujarat",
    "hp": "himachalpradesh",
    "hr": "haryana",
    "jh": "jharkhand",
    "jk": "jammuandkashmir",
    "ka": "karnataka",
    "kl": "kerala",
    "la": "lakshadweep",
    "ld": "ladakh",
    "mh": "maharashtra",
    "ml": "meghalaya",
    "mn": "manipur",
    "mp": "madhyapradesh",
    "mz": "mizoram",
    "nl": "nagaland",
    "or": "odisha",
    "pb": "punjab",
    "py": "puducherry",
    "rj": "rajasthan",
    "sk": "sikkim",
    "tg": "telangana",
    "tn": "tamilnadu",
    "tr": "tripura",
    "tt": "india",
    "up": "uttarpradesh",
    "ut": "uttarakhand",
    "wb": "westbengal"
  },
  getDailyObject(key, date) {
    return {
      key: this.stateMap[key],
      date: date,
      confirmed: null,
      recovered: null,
      deaths: null
    }
  },
  getData(cb) {
    if (!state.india.objects.active) {
      utils.cb = cb;
      httpRequest({ url: "https://api.covid19india.org/data.json" })
        .then(utils.getIndiaData)
        .catch(err => {
          console.log(err);
        });
    } else {
      cb();
    }
  },
  getIndiaData(response) {
    var objects = {};
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
        delta: {
          active: parseInt(obj.deltaactive),
          confirmed: parseInt(obj.deltaconfirmed),
          recovered: parseInt(obj.deltarecovered),
          deaths: parseInt(obj.deltadeaths)
        }
      }
      if (obj.active > max && obj.name !== "Total") {
        max = obj.active;
      }
      if (obj.key === "total") {
        obj.key = "india"
        obj.name = "India"
        state.india = Object.assign(state.india, obj)
      } else {
        objects[obj.key] = obj;
      }
    }
    state.india = Object.assign(state.india, {
      objects: objects,
      max: max
    })
    httpRequest({ url: "https://api.covid19india.org/v2/state_district_wise.json" }).then(utils.getStateData).catch(err => {
      console.log(err);
    });
  },
  getStateData(response) {
    for (var stateI in response) {
      var objects = {};
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
          delta: {
            active: null,
            confirmed: obj.delta.confirmed,
            recovered: null,
            deaths: null
          }
        }
        obj.active = obj.confirmed
        objects[obj.key] = obj;
        if (obj.confirmed > max && obj.name !== "Total") {
          max = obj.confirmed;
        }
      }
      var obj = state.india.objects[response[stateI].state.lowerize()]
      state.india.objects[response[stateI].state.lowerize()] = {
        ...obj, ...{
          objects: objects,
          max: max
        }
      }
    }
    // console.log(state.india.objects.tamilnadu)
    httpRequest({ url: process.env.BASE_URL + "api/chennai.json" }).then(utils.parseChennai).catch(err => console.log(err));
  },
  parseChennai(response) {
    var objects = {};
    var max = 0;
    var total = {
      name: "Chennai",
      key: "chennai",
      active: 0,
      confirmed: 0,
      recovered: 0,
      deaths: 0,
      delta: {
        active: 0,
        confirmed: 0,
        recovered: 0,
        deaths: 0
      }
    }
    for (var i in response) {
      var obj = response[i]
      obj.key = obj.zone.lowerize();
      objects[obj.key] = obj;
      if (obj.confirmed > max && obj.name !== "Total") {
        max = obj.confirmed;
      }
      total.active += obj.active
      total.delta.active += obj.delta.active
      total.recovered += obj.recovered
      total.delta.recovered += obj.delta.recovered
      total.deaths += obj.deaths
      total.delta.deaths += obj.delta.deaths
      total.confirmed += obj.confirmed
      total.delta.confirmed += obj.delta.confirmed
    }
    var obj = state.india.objects.tamilnadu.objects['chennai']
    if (obj.confirmed < total.confirmed) {
      obj = Object.assign(obj, total)
    }else{
      obj.delta.active = total.delta.active
      obj.recovered  = total.recovered;
      obj.delta.recovered = total.delta.recovered
      obj.deaths  = total.deaths;
      obj.delta.deaths = total.delta.deaths
    }
    obj = Object.assign(obj, {
      objects: objects,
      max: max
    });
    httpRequest({ url: "https://api.covid19india.org/states_daily.json" }).then(utils.parseDaily).catch(err => console.log(err));
  },
  parseDaily(response) {
    var statesData = {}
    response = response.states_daily;
    for (var i in response) {
      var data = response[i];
      var date = data.date
      var convertedStatus = data.status.toLowerCase();
      if (convertedStatus === 'deceased') {
        convertedStatus = "deaths"
      }
      for (var baseKey in data) {
        var key = utils.stateMap[baseKey]
        if (key) {
          if (!statesData[key]) {
            statesData[key] = {}
          }
          if (!statesData[key][date]) {
            statesData[key][date] = utils.getDailyObject(baseKey, date)
          }
          statesData[key][date][convertedStatus] = parseInt(data[baseKey]) || 0
        }
      }
    }
    for (var stateDatum in statesData) {
      var data = {}
      var arr = []
      var conArr = [], deathArr = [], recArr = [], activeArr = []
      var stateActive = 0;
      for (var date in statesData[stateDatum]) {
        var dateData = statesData[stateDatum][date]
        arr.push(dateData)
        conArr.push(dateData.confirmed)
        deathArr.push(dateData.deaths)
        recArr.push(dateData.recovered)
        stateActive += dateData.confirmed - dateData.recovered - dateData.deaths
        activeArr.push(stateActive)
      }
      var data = { array: arr, confirmed: conArr, deaths: deathArr, recovered: recArr, active: activeArr }
      var parent = null;
      if (stateDatum === 'india') {
        parent = state.india;
      } else {
        if (!state.india.objects[stateDatum]) {
          state.india.objects[stateDatum] = { name: stateDatum }
        }
        parent = state.india.objects[stateDatum];
      }
      parent.daily=data;
      parent.delta.active = parent.active - parent.daily.active[parent.daily.active.length-1]
    }
    utils.cb();
  },
  cb: null
}
state.getData = utils.getData;
export default state
