<template>
    <div>
        <h1>Paul Was Here</h1>
        <h1>Add Nostr myrelays</h1>
        <v-sheet class="mx-auto" width="300">
            <v-form @submit.prevent>
                <v-text-field label="Nostr Relay" @input="updateRawRelayText" v-model="nostrRelayTextInput"></v-text-field>
                <v-btn class="mt-2" type="submit" @click="addItem" block>Submit</v-btn>
            </v-form>
            <table>
                <tr v-for="(item, index) in myrelays" :key="index"><th>{{ item.name }}</th><th><button @click="removeItem(index)">Remove</button></th></tr>
            </table>
        </v-sheet>
        <h1>Add Nostr Filter</h1>
        <v-textarea label="Label" variant="outlined" @input="updateFilderJSON" v-model="filterJSON"></v-textarea>
        <v-btn @click="fetchNostrEvents">fetchNostrEvents</v-btn><br>
        <v-btn @click="this.validateMyJSON()">Validate JSON</v-btn><br>
        <p>{{ JSONValid }}</p>
        <v-btn @click="console.log(this.filterJSON)">Console.log something</v-btn>
    </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import { SimplePool } from "nostr-tools/pool";

export default {
    setup() {
        // myrelays = list(map(lambda x: x['name'], objects))
    },
    data() {
        return {
            myrelays: [{
                id: "test",
                name: "wss://relay.newatlantis.top"
            }],
            nostrRelayTextInput: '',
            filterJSON: 'Test',
            JSONValid: false
        }
    },
    methods: {
        updateRawRelayText(event) {
            console.log(event.target.value)
            this.nostrRelayTextInput = event.target.value
        },
        updateFilderJSON(event) {
            console.log(event.target.value)
            this.filterJSON = event.target.value
        },
        addItem() {
            console.log("Adding Item")
            if (this.nostrRelayTextInput !== '') {
                this.myrelays.push({
                    id: uuidv4(),
                    name: this.nostrRelayTextInput
                });
                this.nostrRelayTextInput = '';
                console.log(this.myrelays)
            } else {
                alert('Please enter an item to add');
            }
        },
        removeItem(index) {
            this.myrelays.splice(index, 1);
        },
        validateMyJSON(){
            console.log("Validating JSON")
            try {
                JSON.parse(this.filterJSON)
                this.JSONValid = true

            } catch (error) {
                this.JSONValid = false
            }
        },
        async fetchNostrEvents(){
            const relays = this.myrelays.map(obj => obj.name);
            console.log(relays)
            const pool = new SimplePool();
            const events = await pool.querySync(relays, JSON.parse(this.filterJSON));
            console.log(events)
            
        }
    }
}
</script>


<style>
table {
  border-collapse: separate;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
</style>