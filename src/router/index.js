import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import ClimbView from "../views/ClimbView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/:board/:problemId",
    name: "ClimbView",
    component: ClimbView,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
