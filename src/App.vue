<template>
  <div id="app">
    <div class="nav">
      <img src="@/assets/coronavirus.png" height="25px" width="25px" @click="goToHome" />
      <span class="title" @click="goToHome">Covid 19 Tracker</span>
      <span class="bCwrap">
        <router-link
          :to="getRoute(route)"
          v-for="(route,i) in getSplits()"
          :key="i"
          tag="span"
          class="breadCrumb"
          v-text="route"
        />
      </span>
      <span
        v-if="!$route.params.city || $route.params.city!=='chennai'"
        class="chennai"
        @click="goToChennai"
      >Chennai Stats</span>
    </div>
    <router-view class="contWrapper" />
  </div>
</template>

<script>
import router from "@/router/";

export default {
  name: "App",
  created() {
    String.prototype.lowerize = function() {
      return this.toLowerCase()
        .split(" ")
        .join("");
    };
    // Object.prototype.extend = function(obj) {
    //   return { ...this, ...obj };
    // };
  },
  mounted() {
    document.title = "GCC Covid";
  },
  methods: {
    getSplits() {
      if (this.$route.path === "/") {
        return [];
      } else {
        return this.$route.path.substring(1).split("/");
      }
    },
    getRoute(str) {
      var index = this.$route.path.indexOf("/" + str);
      if (index === 0) {
        return { path: "/" + str };
      } else {
        return this.$route.path.substring(0, index) + "/" + str;
      }
    },
    goToHome() {
      if (this.$route.path !== "/india") {
        router.push({ path: "/india" });
      }
    },
    goToChennai() {
      if (this.$route.path !== "/india/tamilnadu/chennai") {
        router.push({ path: "/india/tamilnadu/chennai" });
      }
    }
  }
};
</script>

<style>
#app {
  font-family: Proxima Nova;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
  float: left;
  display: block;
}
.nav {
  height: 40px;
  padding: 5px;
  overflow: hidden;
}

.nav img {
  height: 40px;
  width: 40px;
  cursor: pointer;
}

.nav .title {
  font-weight: bold;
  padding: 10px;
  font-size: 20px;
  cursor: pointer;
}

.nav * {
  float: left;
}
.contWrapper {
  height: calc(100% - 50px);
  overflow: scroll;
}

.breadCrumb {
  margin: 10px;
  cursor: pointer;
  text-transform: capitalize;
  font-size: 20px;
}

.breadCrumb::after {
  content: ">";
  position: relative;
  right: -10px;
  top: 2px;
  color: #979797;
}

.breadCrumb:last-of-type::after {
  content: "";
}
.bCwrap {
  background: #ef73733b;
  color: #dadada;
}
.chennai {
  float: right;
  position: absolute;
  right: 50px;
  top: 15px;
  color: #fff;
  border: 1px solid #979797;
  padding: 5px;
  cursor: pointer;
}
</style>
