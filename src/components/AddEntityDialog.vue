<template>
  <v-dialog
    v-model="isOpened"
    max-width="560"
  >
    <v-card>
      <v-card-title class="headline">
        Add entity
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            sm="12"
          >
            <v-text-field
              v-model="name"
              label="Entity name"
            />
          </v-col>
        </v-row>
        <div class="text-right">
          <v-btn
            color="primary"
            class="mr-2"
            @click="save"
          >
            Save
          </v-btn>
          <v-btn @click="isOpened = false">
            Cancel
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: {
      opened: {
        type: Boolean,
        default: false,
      }
    },
    data: () => ({
      name: null,
    }),
    computed: {
      isOpened: {
        get() {
          return this.opened;
        },
        set(value) {
          if (!value) {
            this.$emit('close');
          }
        }
      },
    },
    methods: {
      save() {
        // TODO: checks
        this.$emit('save', this.name);
      }
    },
  }
</script>