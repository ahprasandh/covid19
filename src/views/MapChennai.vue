<template>
  <div id="map"></div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import * as d3 from "d3";
import * as topojson from "topojson";
import router from '@/router/'

export default {
  name: "Map",
  components: {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      var data = {
        total: { "1": 182, "2": 40 },
        zones: {
          "1": { name: "Thiruvottiyur", count: 4, zone: "1" },
          "2": { name: "Manali", count: 0, zone: "2" },
          "3": { name: "Madhavaram", count: 3, zone: "3" },
          "4": { name: "Tondiarpet", count: 14, zone: "4" },
          "5": { name: "Royapuram", count: 51, zone: "5" },
          "6": { name: "Thiru-Vi-Ka Nagar", count: 25, zone: "6" },
          "7": { name: "Ambattur", count: 0, zone: "7" },
          "8": { name: "Anna Nagar", count: 22, zone: "8" },
          "9": { name: "Teynampet", count: 14, zone: "9" },
          "10": { name: "Kodambakkam", count: 21, zone: "10" },
          "11": { name: "Valasaravakkam", count: 4, zone: "11" },
          "12": { name: "Alandur", count: 2, zone: "12" },
          "13": { name: "Adyar", count: 6, zone: "13" },
          "14": { name: "Perungudi", count: 6, zone: "14" },
          "15": { name: "Sholinganallur", count: 2, zone: "15" }
        }
      };
      this.renderSvg(data);
    },
    getMapName() {
      if (this.$route.path === "/") {
        return "/india";
      }
      return "/tn/chennai";
    },
    renderSvg(stats) {
      this.stats = stats;
      var body = document.body;
      this.width = body.offsetWidth / 2;
      this.height = body.offsetHeight - 50;
      this.svg = d3
        .select("#map")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);
      this.svg
        .append("defs")
        .append("pattern")
        .attr("id", "p1")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 6)
        .attr("height", 6)
        .append("image")
        .attr(
          "xlink:href",
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyB3aWR0aD0nNicgaGVpZ2h0PSc2Jz4KICA8cmVjdCB3aWR0aD0nNicgaGVpZ2h0PSc2JyBmaWxsPScjZWVlZWVlJy8+CiAgPGcgaWQ9J2MnPgogICAgPHJlY3Qgd2lkdGg9JzMnIGhlaWdodD0nMycgZmlsbD0nI2U2ZTZlNicvPgogICAgPHJlY3QgeT0nMScgd2lkdGg9JzMnIGhlaWdodD0nMicgZmlsbD0nI2Q4ZDhkOCcvPgogIDwvZz4KICA8dXNlIHhsaW5rOmhyZWY9JyNjJyB4PSczJyB5PSczJy8+Cjwvc3ZnPg=="
        )
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", 6)
        .attr("height", 6);

      d3.json("/maps" + this.getMapName() + ".json")
        .then(this.plotMap)
        .catch(err => {
          console.log(err);
        });
    },
    plotMap(geo) {
      var stats = this.stats;
      var geography = "chennai"
      var topology = topojson.feature(geo, geo.objects[geography]);
      const projection = d3.geoMercator();
      projection.fitExtent(
        [
          [90, 20],
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
        .on("mouseover", d => {
          var fill = "url(#p1)";
          if (stats.zones[d.properties.zone]) {
            var count = parseInt(stats.zones[d.properties.zone].count);
            fill = d3.interpolateReds(
              count / stats.total[d.properties.district] + 0.3
            );
          }
          d3.select(d3.event.target).attr("fill", fill);
          d3.select(d3.event.target).attr("fill-opacity", 1);
        })
        .on("mouseleave", d => {
          var opac = 0.5;
          var fill = "url(#p1)";
          if (stats.zones[d.properties.zone]) {
            var count = parseInt(stats.zones[d.properties.zone].count);
            opac = count / stats.total[d.properties.district];
            fill = "#ff0000";
          }
          d3.select(d3.event.target).attr("fill", fill);
          d3.select(d3.event.target).attr("fill-opacity", opac);
        })
        .on("click",this.onClick)
        .attr("fill", d => {
          if (stats.zones[d.properties.zone]) {
            return "#ff0000";
          }
          return "url(#p1)";
        })
        .attr("fill-opacity", function(d) {
          if (stats.zones[d.properties.zone]) {
            var count = parseInt(stats.zones[d.properties.zone].count);
            return count / stats.total[d.properties.district] + 0;
          }
          return 0.5;
        })
        .attr("stroke", "#979797")
        .attr("d", path);
    },
    onClick(d) {
      router.push({path:this.$route.path+"/"+d.properties.state.toLowerCase().split(' ').join('')})
    }
  }
};
</script>
