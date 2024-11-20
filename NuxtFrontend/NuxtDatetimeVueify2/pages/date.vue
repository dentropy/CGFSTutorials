<template>
    <v-container>
        <v-row justify="center">
            <v-date-picker width="400"></v-date-picker>
        </v-row>
    </v-container>
    <v-container>
        <v-row justify="space-around">
            <v-time-picker v-model="timeStep" :allowed-minutes="allowedStep" format="24hr"></v-time-picker>
        </v-row>
    </v-container>
</template>