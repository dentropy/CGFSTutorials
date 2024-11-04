<template>

</template>

<script>

export default {
  data() {
    return {
      isMounted: false,
    }
  },
  mounted() {
    if (!this.isMounted) {
      // Your function that needs to run only once after page loading
      // this.doSomething();
      this.isMounted = true;
      console.log(window.nostr)
      console.log(window.nostr.getPublicKey())
    }
  },
}
</script>