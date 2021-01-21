<template>
  <v-app id="app" :style="{ backgroundImage: backgroundImg }">
    <router-view />
  </v-app>
</template>

<script>
import axiox from 'axios';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'Home',
  data() {
    return {};
  },
  computed: {
    ...mapState(['config', 'botId']),
    backgroundImg() {
      if (this.config.background) {
        return `url(${this.config.background})`;
      }
      return '';
    },
  },
  methods: {
    ...mapMutations(['SetConfig', 'SetBotId']),
    async init() {
      this.getBotId();
      this.getConfig();
    },
    async getConfig() {
      let res = await axiox.get(
        `https://${this.botId}.api.gosu.bar/customize/grades_config`
      );
      this.SetConfig(res.data);
    },
    getBotId() {
      let botId = this.$route.query.botId;
      if (!botId) {
        alert('缺少botId');
      }
      this.SetBotId(botId);
    },
  },
  created() {
    this.init();
  },
  components: {},
};
</script>


<style lang="scss">
* {
  box-sizing: border-box;
}

body {
  margin: 0;
}
#app {
  padding: 60px;
  height: 100vh;
  background-size: cover;
  background-repeat: no-repeat;
}
</style>