<template>
  <v-dialog
    v-model="isOpened"
    max-width="400"
  >
    <v-card>
      <v-card-title class="headline">
        Edit relation
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="5"
            sm="12"
          >
            <v-select
              v-model="typeFrom"
              :items="RELATIONS_TYPES"
              menu-props="auto"
              hide-details
              label="Type from"
              single-line
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
            sm="12"
          >
            <div class="title text-center mt-4">
              TO
            </div>
          </v-col>
          <v-col
            cols="12"
            md="5"
            sm="12"
          >
            <v-select
              v-model="typeTo"
              :items="RELATIONS_TYPES"
              menu-props="auto"
              hide-details
              label="Type to"
              single-line
            />
          </v-col>
        </v-row>
        <div class="text-right mt-2">
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
  import { RELATIONS_TYPES } from '../constants/relations.constants';

  export default {
    props: {
      opened: {
        type: Boolean,
        default: false,
      },
      relation: {
        type: Object,
        default: () => ({}),
      },
    },
    data: () => ({
      typeFrom: RELATIONS_TYPES[0],
      typeTo: RELATIONS_TYPES[0],
      RELATIONS_TYPES: RELATIONS_TYPES,
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
    watch: {
      typeFrom: function(val) {
        if (val === RELATIONS_TYPES[1] && this.typeTo === RELATIONS_TYPES[1]) {
          this.typeTo = RELATIONS_TYPES[0];
        }
      },
      typeTo: function(val) {
        if (val === RELATIONS_TYPES[1] && this.typeFrom === RELATIONS_TYPES[1]) {
          this.typeFrom = RELATIONS_TYPES[0];
        }
      },
    },
    methods: {
      save() {
        this.$emit('save', this.typeFrom, this.typeTo);
        this.typeFrom = RELATIONS_TYPES[0];
        this.typeTo = RELATIONS_TYPES[0];
      }
    },
  }
</script>