<template>
  <div v-if="!inner">
    <div class="map" id="map" @mouseover.stop="">
      <span class="message" v-text="mapMessage" />
      <svg id="chloropath" style="z-index: 1;" @mouseover.stop="()=>{}">
        <defs>
          <pattern id="p1" patternUnits="userSpaceOnUse" width="6" height="6">
            <image
              xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyB3aWR0aD0nNicgaGVpZ2h0PSc2Jz4KICA8cmVjdCB3aWR0aD0nNicgaGVpZ2h0PSc2JyBmaWxsPScjZWVlZWVlJy8+CiAgPGcgaWQ9J2MnPgogICAgPHJlY3Qgd2lkdGg9JzMnIGhlaWdodD0nMycgZmlsbD0nI2U2ZTZlNicvPgogICAgPHJlY3QgeT0nMScgd2lkdGg9JzMnIGhlaWdodD0nMicgZmlsbD0nI2Q4ZDhkOCcvPgogIDwvZz4KICA8dXNlIHhsaW5rOmhyZWY9JyNjJyB4PSczJyB5PSczJy8+Cjwvc3ZnPg=="
              x="0"
              y="0"
              width="6"
              height="6"
            />
          </pattern>
        </defs>
      </svg>
    </div>
    <div v-if="!loading" class="stats" @mouseover="current.target=null;setData()">
      <span
        class="source"
        v-text="$route.params.city==='chennai'?'Data Source - https://twitter.com/chennaicorp':'Data Source - https://api.covid19india.org'"
      />
      <div class="region">
        <span v-text="data.name"></span>
      </div>
      <div class="wrapper">
        <div class="holder active">
          <span class="title">Active</span>
          <span v-if="data.daily">
            <line-chart
              v-if="data.daily"
              class="chart"
              id="active"
              :data="data.daily.active"
              :cumulate="false"
              :color="data.delta.active<0 || data.active < data.confirmed/2 ?'#83e46c':'#ca6565'"
            />
          </span>
          <span :class="{invert:data.delta.active<0}" class="delta" v-text="data.delta.active || 0"></span>
          <span v-text="data.active || 'N/A'"></span>
        </div>
        <div class="holder recovered">
          <span class="title">Recovered</span>
          <line-chart
            id="recovered"
            v-if="data.daily"
            class="chart"
            :data="data.daily.recovered"
            color="#83e46c"
          />
          <span class="delta" v-text="data.delta.recovered || 0"></span>
          <span v-text="data.recovered || 'N/A'"></span>
        </div>
        <div class="holder death">
          <span class="title">Deceased</span>
          <line-chart
            id="death"
            v-if="data.daily"
            class="chart"
            :data="data.daily.deaths"
            color="#979797"
          />
          <span class="delta" v-text="data.delta.deaths || 0"></span>
          <span v-text="data.deaths || 'N/A'"></span>
        </div>
        <div class="holder confirmed">
          <span class="title">Confirmed</span>
          <line-chart
            v-if="data.daily"
            class="chart"
            :data="data.daily.confirmed"
            :cumulate="false"
            color="#5862e4"
          />
          <span class="delta" v-text="data.delta.confirmed || 0"></span>
          <span v-text="data.confirmed || 'N/A'"></span>
        </div>
      </div>
      <div v-show="current.target==null" class="table">
        <table align="center">
          <thead class="row">
            <th
              class="header"
              @click="setSort('name')"
              :class="{active:sort.key==='name',asc:sort.asc}"
            >Region</th>
            <th
              class="header"
              @click="setSort('active')"
              :class="{active:sort.key==='active',asc:sort.asc}"
            >Active</th>

            <th
              class="header"
              @click="setSort('recovered')"
              :class="{active:sort.key==='recovered',asc:sort.asc}"
            >Recovered</th>
            <th
              class="header"
              @click="setSort('deaths')"
              :class="{active:sort.key==='deaths',asc:sort.asc}"
            >Deceased</th>
            <th
              class="header confirmed"
              @click="setSort('confirmed')"
              :class="{active:sort.key==='confirmed',asc:sort.asc}"
            >Confirmed</th>
          </thead>
          <tr
            v-for="(data,i) in table"
            :key="i"
            class="row"
            :class="{'total':data.name && data.name.toLowerCase()==='total'}"
          >
            <td>
              <span v-if="data.daily && data.daily.active">
                <line-chart class="chart" :data="data.daily.active" :cumulate="false" />
              </span>
              <span class="data" v-text="data.name"></span>
            </td>
            <td>
              <span
                class="delta active"
                :class="{invert:data.delta.active<0}"
                v-if="data.delta && data.delta.active && data.delta.active != 0"
                v-text="data.delta.active"
              ></span>
              <span class="data" v-text="data.active"></span>
            </td>
            <td>
              <span
                class="delta recovered"
                v-if="data.delta && data.delta.recovered > 0"
                v-text="data.delta.recovered"
              ></span>
              <span
                class="data"
                v-text="(data.recovered || data.recovered===0)?data.recovered:'N/A'"
              ></span>
            </td>
            <td>
              <span
                class="delta deaths"
                v-if="data.delta && data.delta.deaths > 0"
                v-text="data.delta.deaths"
              ></span>
              <span class="data" v-text="(data.deaths || data.deaths===0)?data.deaths:'N/A'"></span>
            </td>
            <td>
              <span v-if="data.daily && data.daily.confirmed">
                <line-chart class="chart" :data="data.daily.confirmed" :cumulate="false" />
              </span>
              <span
                class="delta confirmed"
                v-if="data.delta && data.delta.confirmed > 0"
                v-text="data.delta.confirmed"
              ></span>
              <span class="data" v-text="data.confirmed"></span>
            </td>
          </tr>
        </table>
      </div>
      <Map
        id="innerMap"
        inner="true"
        :propGeography="current.geography"
        :propGeographyType="current.geographyType"
        :mapPath="current.mapPath"
        v-if="current.target!==null"
      />
    </div>
    <div v-if="loading" class="loading">Loading...</div>
  </div>
  <div v-else>
    <svg id="innerchloropath" style="z-index: 1;" />
  </div>
</template>
<style>
.map,
.stats {
  float: left;
  height: 100%;
  width: fit-content;
  position: relative;
}
.stats {
  margin: 20px;
  margin: 20px;
  height: calc(100% - 40px);
  overflow: scroll;
  max-width: calc(100% - 40px);
}
.stats .holder {
  border-radius: 1px;
  margin: 5px;
  float: left;
  width: fit-content;
  display: flex;
  align-items: center;
  flex-direction: column;
  background: #00000021;
  border-radius: 5px;
  padding: 5px;
  width: 25%;
  overflow: hidden;
  font-weight: bold;
}
.stats .source {
  position: absolute;
  top: 30px;
  right: 0;
  white-space: nowrap;
  color: #979797;
  width: 100%;
  text-align: right;
  font-size: 12px;
}
.stats .wrapper {
  position: relative;
  top: 25px;
  width: 100%;
  display: flex;
}
.stats .holder .title {
  font-weight: bolder;
}
.stats .holder .delta::before {
  content: "↑";
  font-size: 20px;
  line-height: 15px;
}
.stats .table .delta::before {
  content: "↑";
  font-size: 20px;
  line-height: 15px;
}
.stats .table .delta.active.invert::before,
.stats .holder .delta.invert::before {
  content: "↓";
}
.stats .region {
  position: relative;
  font-size: 20px;
  justify-content: left;
  text-align: left;
  padding: 0 7px;
  text-transform: uppercase;
  background: #1313132b;
}
.stats .holder.active {
  /* background: #ca656591; */
}
.stats .holder.active,
.stats .table .delta.active {
  color: #ca6565;
}
.stats .table .delta.active.invert,
.stats .holder .delta.invert {
  color: #83e46c;
}
.stats .holder.confirmed {
  /* background: #daa423;
  color: #000; */
}
.stats .holder.confirmed,
.stats .table .delta.confirmed {
  color: #5862e4;
}
.stats .holder.recovered {
  /* background: #83e46c8f; */
}
.stats .holder.recovered,
.stats .table .delta.recovered {
  color: #83e46c;
}
.stats .holder.death {
  /* background: #ffffff26; */
}
.stats .holder.death,
.stats .table .delta.deaths {
  color: #ffffff;
}
.loading {
  position: absolute;
  width: 100%;
  height: 100%;
  font-size: 50px;
}
.stats .table,
.stats #innerMap {
  top: 50px;
  position: relative;
  overflow: scroll;
  height: calc(100% - 245px);
}
.stats .table .row td,
.stats .table .row th {
  padding: 5px 15px;
  position: relative;
  vertical-align: bottom;
  max-width: 120px;
}

.stats .table .row:nth-of-type(even) {
  background: #97979711;
}
.stats .table thead.row {
  color: #fff7e7;
  background: #5a504d;
}
.stats .table thead.row th {
  position: sticky;
  top: 0;
  background: #5a504d;
  z-index: 2;
}
.stats .table .row.total {
  opacity: 1;
  background: #979797;
  color: #000;
}
.stats .table .row .data,
.stats .table .row .delta {
  width: 100%;
  overflow: hidden;
  display: block;
  text-align: end;
  float: right;
  margin: 5px;
  white-space: normal;
  word-break: break-word;
}
.stats .table .row td:first-of-type .data,
.stats .table .row th:first-of-type {
  text-align: left;
  float: left;
  width: calc(100% - 20px);
}
.stats .table .row .header {
  cursor: pointer;
}
.stats .table .row .header.active::after {
  content: "⤒";
  color: #b5acac;
  position: absolute;
  right: 0px;
  top: 6px;
}
.stats .table .row .header.active.asc::after {
  content: "⤓";
  top: 5px;
}
.chart {
  height: 75px;
  width: 75px;
  position: relative;
  top: 0;
  margin: 5px;
}
.map .message {
  color: #979797;
  position: absolute;
  top: 20px;
  left: 10px;
}
</style>
<script>
import { mapState, mapGetter, mapActions } from "vuex";
import * as d3 from "d3";
import * as topojson from "topojson";
import router from "@/router/";
import state from "@/state/";
import { httpRequest } from "@/utils/";
import LineChart from "@/assets/LineChart";

export default {
  name: "Map",
  props: {
    inner: { default: false },
    propGeography: { default: "india" },
    propGeographyType: { default: "state" },
    mapPath: {}
  },
  components: {
    LineChart
  },
  data() {
    return {
      loading: true,
      state: state,
      svg: null,
      geography: "india",
      geographyType: "country",
      data: {
        region: "India",
        active: 0,
        confirmed: 0,
        recovered: 0,
        deaths: 0,
        delta: { active: 0, confirmed: 0, deltarecovered: 0, deltadeaths: 0 }
      },
      current: {
        target: null,
        d: null
      },
      sort: {
        key: "active",
        asc: false
      },
      maps: {},
      mapMessage: "Click to view individual Stats"
    };
  },
  mounted() {
    if (this.inner) {
      this.mapStart();
    } else {
      state.getData(this.mapStart);
    }
  },
  watch: {
    mapPath() {
      this.mapStart();
    },
    $route() {
      this.mapStart();
    }
  },
  computed: {
    stats() {
      if (!this.inner) {
        if (this.$route.params.city) {
          this.geography = this.$route.params.city;
          this.geographyType = "city";
          this.hoverGeographyType = "district";
          return state.india.objects[this.$route.params.state].objects[
            this.$route.params.city
          ];
        } else if (this.$route.params.state) {
          this.geography = this.$route.params.state + "_district";
          this.geographyType = "state";
          this.hoverGeographyType = "city";
          return state.india.objects[this.$route.params.state];
        } else {
          this.geography = "india";
          this.geographyType = "country";
          this.hoverGeographyType = "state";
          return state.india;
        }
      } else {
        this.geography = this.propGeography;
        this.geographyType = this.propGeographyType;
        if (this.propGeographyType == "country") {
          return state.india;
        } else if (this.propGeographyType == "state") {
          this.geography = this.propGeography + "_district";
          return state.india.objects[this.propGeography];
        } else {
          return state.india.objects[this.$route.params.state].objects[
            this.propGeography
          ];
        }
      }
    },
    table() {
      var table = [];
      var iter = JSON.parse(JSON.stringify(this.stats.objects));
      for (var key in iter) {
        var obj = this.stats.objects[key];
        table.push({
          name: obj.name,
          active: obj.active,
          confirmed: obj.confirmed,
          recovered: obj.recovered,
          deaths: obj.deaths,
          delta: obj.delta,
          daily: obj.daily
        });
      }
      return table.sort(this.sortByProperty(this.sort.key, this.sort.asc));
    }
  },
  methods: {
    setSort(p) {
      if (this.sort.key === p) {
        this.sort.asc = !this.sort.asc;
      } else {
        this.sort.key = p;
      }
    },
    sortByProperty(p, asc) {
      return function(a, b) {
        if (p === "name") {
          if (b[p] === "Total" && !asc) return -1;
          if (a[p] === "Total" && !asc) return 1;
          if (a[p] === "Total" && asc) return 1;
          if (a[p] > b[p]) return asc ? 1 : -1;
          if (a[p] < b[p]) return asc ? -1 : 1;
          return 0;
        }
        if (asc) {
          return a[p] - b[p];
        } else {
          return b[p] - a[p];
        }
      };
    },
    mapStart() {
      this.loading = true;
      this.current.target = null;
      if (this.svg) {
        d3.selectAll(
          "#" + (this.inner ? "inner" : "") + "chloropath > path"
        ).remove();
        this.svg = null;
      }
      this.setData();
      this.renderSvg();
    },
    getMapName() {
      if (this.inner) {
        return this.mapPath;
      }
      if (this.$route.path === "/") {
        return "/india";
      }
      return this.$route.path;
    },
    renderSvg() {
      if (!this.inner) {
        this.width =
          document.body.offsetWidth > 600
            ? document.body.offsetWidth / 2
            : document.body.offsetWidth;
        this.height = document.body.offsetHeight - 50;
        this.svg = d3
          .select("#chloropath")
          .attr("width", this.width)
          .attr("height", this.height);
      } else {
        var elem = d3
          .select("#innerMap")
          .node()
          .getBoundingClientRect();
        this.width = elem.width;
        this.height = elem.height;
        this.svg = d3
          .select("#innerchloropath")
          .attr("width", this.width)
          .attr("height", this.height);
      }
      var mapUrl = process.env.BASE_URL + "maps" + this.getMapName() + ".json";
      var func = this.storeLoadedMap;
      if (this.maps[mapUrl]) {
        this.plotMap(this.maps[mapUrl]);
      } else {
        d3.json(process.env.BASE_URL + "maps" + this.getMapName() + ".json")
          .then(geo => {
            func(geo, mapUrl);
          })
          .catch(err => {
            console.log(err);
            //   console.log(err + "-" + this.inner + "-" + this.getMapName());
            console.log("NO MAP " + this.getMapName());
          });
      }
    },
    storeLoadedMap(geo, mapUrl) {
      var topology = topojson.feature(geo, geo.objects[this.geography]);
      this.maps[mapUrl] = topology;
      this.plotMap(topology);
    },
    plotMap(topology) {
      var stats = this.stats;
      var projection = d3.geoMercator();
      projection.fitExtent(
        [
          [20, 50],
          [this.width, this.height]
        ],
        topology
      );

      var path = d3.geoPath(projection);

      this.svg
        .selectAll("ctk")
        .data(topology.features)
        .enter()
        .append("path")
        .on("click", this.onClick)
        .on("mouseover", this.onHover)
        .on("mouseout", this.onHoverOff)
        .attr("fill", this.calcFill)
        .attr("fill-opacity", this.calcOpacity)
        .attr("stroke", "#979797")
        .style("cursor", d => {
          if (d.properties.state) {
            return "grabbing";
          } else {
            return "default";
          }
        })
        .attr("d", path);
      this.loading = false;
    },
    getKey(d) {
      var key = null;
      //   console.log(d.properties);
      if (this.geographyType === "country") {
        key = d.properties.state.lowerize();
      } else if (this.geographyType === "state") {
        key = d.properties.district.lowerize();
      } else {
        key = d.properties.zone.lowerize();
      }
      return key;
    },
    calcRatio(d) {
      var ratio = NaN;
      var data = this.stats.objects[this.getKey(d)];
      if (data) {
        ratio = (data.active || data.confirmed) / this.stats.max;
      }
      return ratio;
    },
    calcFill(d) {
      return this.stats.objects[this.getKey(d)] ? "#ff0000" : "url(#p1)";
    },
    calcFillOnHover(d) {
      var fill = "url(#p1)";
      var ratio = this.calcRatio(d);
      if (!isNaN(ratio)) {
        fill = d3.interpolateReds(ratio);
      }
      return fill;
    },
    calcOpacity(d) {
      var opacity = "0.3";
      var ratio = this.calcRatio(d);
      if (!isNaN(ratio)) {
        if (this.geographyType === "country") {
          opacity = 0.3 * ratio;
        } else if (this.geographyType === "state") {
          opacity = 0.5 * ratio;
        } else {
          opacity = 0.5 * ratio;
        }
      }
      return opacity;
    },
    onClick(d) {
      if (d.properties.state) {
        router.push({
          path: this.$route.path + "/" + d.properties.state.lowerize()
        });
      }
    },
    resetFill(d) {
      d3.select(this.current.target).attr("fill", this.calcFill(d));
      d3.select(this.current.target).attr("fill-opacity", this.calcOpacity(d));
    },
    onHover(d) {
      if (this.current.target != d3.event.target) {
        if (this.current.target) {
          this.resetFill(this.current.d);
        }
        var key = this.getKey(d);
        this.current = {
          target: d3.event.target,
          d: d,
          geography: key,
          geographyType: this.hoverGeographyType,
          mapPath: this.$route.path + "/" + key
        };

        d3.select(d3.event.target).attr("fill", this.calcFillOnHover(d));
        d3.select(d3.event.target).attr("fill-opacity", 1);
        this.setData(key, d);
      }
      d3.event.stopPropagation();
    },
    onHoverOff(d) {
      this.resetFill(d);
    },
    setData: function(key, d) {
      if (key) {
        if (this.stats.objects && this.stats.objects[key]) {
          this.data = JSON.parse(JSON.stringify(this.stats.objects[key]));
        } else {
          this.data = {
            region:
              d.properties.name || d.properties.district || d.properties.state,
            active: null,
            confirmed: null,
            deltaactive: null,
            deltaconfirmed: null
          };
        }
      } else {
        if (
          this.stats &&
          this.stats.active &&
          this.data.name !== this.stats.name
        ) {
          var obj = {
            active: this.stats.active,
            name: this.stats.name,
            confirmed: this.stats.confirmed,
            recovered: this.stats.recovered,
            deaths: this.stats.deaths,
            delta: this.stats.delta,
            daily: this.stats.daily
          };
          this.data = JSON.parse(JSON.stringify(obj));
        }
      }
    },
  }
};
</script>
