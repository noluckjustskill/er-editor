<template>
  <v-dialog
    v-model="isOpened"
    max-width="700"
  >
    <v-snackbar
      v-model="snackbar"
      top
      right
      color="error"
      :timeout="4000"
    >
      <span class="subtitle-1">{{ snackbarMessage }}</span>
    </v-snackbar>
    <v-card>
      <v-card-title class="headline">
        Add field
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            sm="12"
            md="6"
          >
            <v-text-field
              v-model="name"
              label="Field name"
            />
          </v-col>
          <v-col
            cols="12"
            sm="12"
            md="6"
          >
            <v-select
              v-model="type"
              :items="types"
              menu-props="auto"
              hide-details
              label="Type"
              single-line
              @change="swichType"
            />
          </v-col>
          <v-col
            cols="12"
            sm="12"
            md="6"
          >
            <v-text-field
              v-model="length"
              :disabled="!allowLength"
              label="Length"
              type="number"
            />
            <v-text-field
              v-model="defaultValue"
              :disabled="!alowDefaultValue"
              :label="defaultValueLabel"
              :type="defaultValueType"
            />
          </v-col>
          <v-col
            cols="12"
            sm="12"
            md="6"
          >
            <v-checkbox
              v-model="nullable"
              label="Nullable"
            />
            <v-checkbox
              v-model="unsigned"
              :disabled="!allowUnsigned"
              label="Unsigned"
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
  import moment from 'moment';
  import { MySQLTypes } from '../constants/mysql-types.constants';

  export default {
    props: {
      opened: {
        type: Boolean,
        default: false,
      }
    },
    data: () => ({
      name: null,
      type: 'INT',
      nullable: true,
      unsigned: false,
      length: null,
      defaultValue: null,

      types: Object.keys(MySQLTypes),

      snackbar: false,
      snackbarMessage: null,
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
      defaultValueType() {
        return MySQLTypes[this.type].type;
      },
      defaultValueLabel() {
        return `Default value ${MySQLTypes[this.type].pattern ? `(${MySQLTypes[this.type].pattern})` : ''}`;
      },
      allowLength () {
        return MySQLTypes[this.type].type === 'string' && !MySQLTypes[this.type].pattern;
      },
      allowUnsigned() {
        return MySQLTypes[this.type].type === 'number' && !MySQLTypes[this.type].dennyUnsigned;
      },
      alowDefaultValue() {
        return Boolean(MySQLTypes[this.type].allowDefault);
      },
    },
    methods: {
      swichType() {
        if (!this.allowUnsigned) {
          this.unsigned = false;
        }
        this.length = null;
      },
      save() {
        if (!this.name) {
          this.snackbarMessage = 'Name must be set';
          this.snackbar = true;
          return;
        }

        if (this.length && (parseInt(this.length) <= 0 || parseInt(this.length) > MySQLTypes[this.type].maxLength)) {
          this.snackbarMessage = 'Invalid length';
          this.snackbar = true;
          return;
        }

        if (this.defaultValue) {
          if (MySQLTypes[this.type].type === 'string') {
            if (MySQLTypes[this.type].pattern) {
              if (!moment(this.defaultValue, MySQLTypes[this.type].pattern, true).isValid()) {
                this.snackbarMessage = 'Invalid default value pattern';
                this.snackbar = true;
                return;
              }
            } else if (MySQLTypes[this.type].maxLength) {
              if (this.defaultValue.length > (this.length || MySQLTypes[this.type].maxLength)) {
                this.snackbarMessage = 'Invalid default value length';
                this.snackbar = true;
                return;
              }
            }
          } else if (MySQLTypes[this.type].type === 'number') {
            if (this.unsigned && Number(this.defaultValue) < 0) {
              this.snackbarMessage = 'Invalid default value';
              this.snackbar = true;
              return;
            }

            if (Math.abs(Number(this.defaultValue)) > MySQLTypes[this.type].maxLength) {
              this.snackbarMessage = 'Invalid default value length';
              this.snackbar = true;
              return;
            }
          }
        }

        this.$emit('save', {
          name: this.name,
          type: this.type,
          nullable: this.nullable,
          unsigned: this.unsigned,
          length: this.length,
          defaultValue: this.defaultValue,
        });
      }
    },
  }
</script>