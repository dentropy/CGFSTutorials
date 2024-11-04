<template>
    <div>
      <input v-model="username" type="text" placeholder="Enter your name">
      {{ username }}
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: ''
      }
    }
  }
  </script>