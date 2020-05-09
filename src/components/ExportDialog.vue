<template>
  <v-dialog
    v-model="isOpened"
    max-width="560"
  > 
    <v-snackbar
      v-model="snackbar"
      top
      right
      color="primary"
      :timeout="4000"
    >
      <span class="subtitle-1">Copied!</span>
    </v-snackbar>
    <v-card>
      <v-card-title class="headline">
        Export
      </v-card-title>
      <v-card-text>
        <div
          class="code mb-4 pa-2"
          v-html="highlightSQL"
        />
        <div class="text-right">
          <v-btn
            color="primary"
            class="mr-2"
            @click="copy"
          >
            <v-img
              :src="require('@/assets/copy.png')"
              width="16"
              height="16"
              class="mr-1"
            />
            Copy
          </v-btn>
          <v-btn @click="isOpened = false">
            Close
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import copy from 'copy-to-clipboard';
  import hljs from 'highlight.js/lib/core';
  import sql from 'highlight.js/lib/languages/sql';

  hljs.registerLanguage('sql', sql);
  hljs.configure({useBR: true});

  export default {
    props: {
      opened: {
        type: Boolean,
        default: false,
      },
      sql: {
        type: String,
        default: '',
      }
    },
    data: () => ({
      snackbar: false,
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
      highlightSQL() {
        return hljs.highlight('sql', this.sql).value;
      },
    },
    methods: {
      copy() {
        copy(this.sql);
        this.snackbar = true;
      }
    },
  }
</script>

<style scoped>
  .code {
    background-color: #f6f8fa;
    white-space: pre;
    line-height: 1rem;
    font-family: monospace;
    font-size: 0.8rem;
    tab-size: 20px;
  }
</style>