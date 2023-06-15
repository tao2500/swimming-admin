<template>
  <div class="dashboard-container">
<!--    <component :is="currentRole" />-->
<!--    请求到的参数：{{ this.$route.query.id }}?-->
<!--    {{this.people}}-->
    <img src="./全景.jpg" style="width: 100%">
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import editorDashboard from './editor'

export default {
  name: 'Dashboard',
  components: { adminDashboard, editorDashboard },
  data() {
    return {
      currentRole: 'adminDashboard',
      people: '参数为空'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created() {
    if (!this.roles.includes('admin')) {
      this.currentRole = 'editorDashboard'
    }
    this.people = window.location.search.substring(0)
    // afterUrl.substring(afterUrl.indexof('=')+1).toUpperCase();
  }
}
</script>
