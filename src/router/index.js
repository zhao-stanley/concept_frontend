import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import ClimbView from "../views/ClimbView.vue";
import CreateProblem from "../views/CreateProblem.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/create",
    name: "CreateProblem",
    component: CreateProblem,
  },
  {
    path: "/:size/:problemId",
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
