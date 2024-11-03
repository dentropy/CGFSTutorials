<template>
    <v-container>
      <v-row justify="space-around">
  
        <v-time-picker
          v-model="timeStep"
          :allowed-minutes="allowedStep"
          format="24hr"
        ></v-time-picker>
      </v-row>
    </v-container>
  </template>