import Vue from 'vue'
import VueRouter from 'vue-router'
import Map from '../views/Map'
import MapChennai from '../views/MapChennai'
import NotFound from '../views/NotFound'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/india/tamilnadu/chennai'
  },
  // {
  //   path:'/india/tamilnadu/chennai',
  //   component:Map
  // },
  {
    path: '/india',
    name: 'd',
    component: Map,
    children: [
      {
        path: ':state',
        children: [
          {
            path: ':city'
          }
        ]
      }
    ]
  },

  {
    path: '*',
    component: NotFound
  }
]
var baseUrl=process.env.BASE_URL;
if(process.env.NODE_ENV !== 'production'){
  baseUrl+="covid19/"
}
const router = new VueRouter({
  mode: 'history',
  base: baseUrl,
  routes
})

export default router
