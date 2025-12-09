<template>
  <div class="home-view">
    <PaletteGenerator />
  </div>
</template>

<script>
import PaletteGenerator from '../components/PaletteGenerator.vue'

export default {
  name: 'HomeView',
  components: {
    PaletteGenerator
  }
}
</script>

<style scoped>
.home-view {
  width: 100%;
}
</style>