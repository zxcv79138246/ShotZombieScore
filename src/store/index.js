import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: {},
    // 2320
    botId: "",
  },
  mutations: {
    SetConfig(state, data) {
      state.config = data;
    },
    SetBotId(state, data) {
      state.botId = data;
    },
  },
  actions: {},
  modules: {},
});
