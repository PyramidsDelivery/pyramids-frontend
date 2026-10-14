<script setup>
import TopPerfilWidget from './components/TopPerfilWidget.vue';
</script>

<template>
  <div id="app">
    <TopPerfilWidget />
    <router-view />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f2f2f2;
  font-family: sans-serif;
  box-sizing: border-box;
}

#app {
  width: 100%;
  min-height: 100vh;
  position: relative;
}
</style>