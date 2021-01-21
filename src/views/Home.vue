<template>
  <div class="home">
    <div class="top">
      <div class="rank" v-for="(team, index) in teams" :key="index">
        <img :src="config.no1" alt="" v-if="index == 0" />
        <img :src="config.no2" alt="" v-if="index == 1" />
        <img :src="config.no3" alt="" v-if="index == 2" />
      </div>
    </div>
    <transition-group class="team-block" name="flip-list" tag="ul">
      <div class="team" v-for="team in teams" :key="team.name">
        <div
          class="team-name"
          :style="{ color: config.colors ? config.colors[team.id] : '' }"
        >
          {{ team.name }}
        </div>
        <div class="team-score" :value="team.score" v-show="isTotalShow">
          {{ team.score | currency }}
        </div>
        <transition-group class="member-block" name="flip-list-inside">
          <div class="member" v-for="member in team.members" :key="member.id">
            <div class="avatar">
              <img
                :src="member.picture ? member.picture : config.avatar"
                alt=""
              />
            </div>
            <div class="nick-name">
              {{ member.name | hideLongName }}
            </div>
            <div class="score">
              {{ member.score ? member.score : 0 | currency }}
            </div>
          </div>
        </transition-group>
      </div>
    </transition-group>
    <div class="btn-box">
      <v-btn
        class="button"
        @click="handlePlay"
        elevation="2"
        :color="isPlay ? 'error' : 'primary'"
      >
        {{ isPlay ? '暫停' : '播放' }}
      </v-btn>
      <v-btn
        class="button"
        @click="handleTotalShow"
        elevation="2"
        :color="isTotalShow ? 'secondary' : 'success'"
      >
        {{ isTotalShow ? '隱藏總分' : '顯示總分' }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import axiox from 'axios';
import { mapState } from 'vuex';
import _ from 'lodash';

export default {
  name: 'Home',
  data() {
    return {
      teams: [],
      maxMemeberNum: 0,
      isPlay: false,
      isTotalShow: false,
      interval: undefined,
    };
  },
  computed: {
    ...mapState(['config', 'botId']),
  },
  methods: {
    handlePlay() {
      this.isPlay = !this.isPlay;
      if (this.isPlay) {
        this.getGradesData();
        this.interval = setInterval(() => {
          this.getGradesData();
        }, 3000);
      } else {
        clearInterval(this.interval);
      }
    },
    handleTotalShow() {
      this.isTotalShow = !this.isTotalShow;
    },
    async init() {
      this.getGradesData();
    },
    formatToCurrency(num) {
      const parts = num.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    },
    async getGradesData() {
      let res = await axiox.get(
        `https://${this.botId}.api.gosu.bar/customize/grades_data`
      );
      let gradesData = res.data;
      let group = _.groupBy(gradesData, (item) => {
        return item.group;
      });

      let i = 0;

      let lengthArray = [];
      for (let key in group) {
        let length = group[key].length;
        lengthArray.push(length);
      }
      this.maxMemeberNum = _.max(lengthArray);
      for (let key in group) {
        let members = group[key];

        let hasTeamIndex = _.findIndex(this.teams, function (o) {
          return o.name == key;
        });
        if (hasTeamIndex != -1) {
          let teamMembers = this.teams[hasTeamIndex]['members'];

          for (let m of members) {
            let hasMemberIndex = _.findIndex(teamMembers, function (o) {
              return o.id == m.id;
            });
            if (hasMemberIndex != -1) {
              teamMembers[hasMemberIndex]['score'] = m.score;
            } else {
              teamMembers.push(m);
            }
          }
          let totalScore = teamMembers.reduce((total, current) => {
            return total + current.score;
          }, 0);
          let teamMemberLength = teamMembers.length;
          let bonusScore = Math.round(
            (totalScore / teamMemberLength) * this.maxMemeberNum
          );
          this.teams[hasTeamIndex]['score'] = bonusScore;
          teamMembers = _.sortBy(teamMembers, ['score', 'id']);
          this.teams[hasTeamIndex]['members'] = teamMembers.reverse();
        } else {
          let totalScore = members.reduce((total, current) => {
            return total + current.score;
          }, 0);
          let teamMemberLength = members.length;
          let bonusScore = Math.round(
            (totalScore / teamMemberLength) * this.maxMemeberNum
          );
          members = _.sortBy(members, ['score', 'id']);
          members = members.reverse();
          let teamLength = this.teams.length;
          this.teams.push({
            id: teamLength,
            name: key,
            members: members,
            score: bonusScore,
          });
        }

        i++;
        if (i === 6) {
          break;
        }
      }
      this.teams = _.sortBy(this.teams, ['score', 'name']);
      this.teams = this.teams.reverse();
    },
  },
  created() {
    this.init();
  },
  filters: {
    currency(num) {
      const parts = num.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    },
    hideLongName(text) {
      if (text.length > 16) {
        let tmp = text.slice(0, 16);
        return tmp + '...';
      }
      return text;
    },
  },
  components: {},
};
</script>

<style lang="scss">
.v-application--wrap {
  min-height: 0;
}
.btn-box {
  position: absolute;
  right: -30px;
  bottom: -30px;
  display: flex;
  width: 187px;
  height: 36px;
  background-color: transparent;

  .button {
    margin: 0 7px;
    display: none;
  }
}

.btn-box:hover {
  .button {
    display: block;
  }
}

.top {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;

  .rank {
    flex: 1;
    display: flex;
    justify-content: center;
    margin: 0 15px;
    max-width: 400px;

    img {
      width: 60%;
      max-width: 250px;
    }
  }
}
.team-block {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0;
  list-style-type: none;
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0;
}
.team {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-content: center;
  background-color: rgba(255, 255, 255, 0.5);
  margin: 0 15px;
  padding: 15px 0 50px 0;
  border-radius: 15px;
  max-width: 400px;

  .team-name {
    display: flex;
    justify-content: center;
    font-size: 36px;
    font-weight: bold;
  }

  .team-score {
    font-size: 36px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 15px;
  }
}

.member-block {
  .member {
    display: flex;
    align-items: center;
    margin: 12px 15px;

    .avatar {
      flex: 2;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 40px;
        height: 40px;
        border-radius: 100px;
        border: 1px solid black;
      }
    }
    .nick-name {
      flex: 4;
      margin-left: 10px;
      font-size: 16px;
    }
    .score {
      flex: 2;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
    }
  }
}
.flip-list-move {
  transition: transform 1.4s;
}
.flip-list-inside-move {
  transition: transform 0.7s;
}
</style>
