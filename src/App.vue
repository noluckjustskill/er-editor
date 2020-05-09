<template>
  <v-app id="app">
    <v-snackbar
      v-model="snackbar"
      top
      right
      color="error"
      :timeout="4000"
    >
      <span class="subtitle-1">{{ snackbarMessage }}</span>
    </v-snackbar>
    <v-content>
      <v-container
        id="container"
        ref="container"
      >
        <div id="toolbar">
          <v-btn
            color="primary"
            @click="addEntityDialog = true"
          >
            <v-icon
              small
              class="mr-1"
            >
              mdi-plus
            </v-icon>
            Add
          </v-btn>
          <v-btn
            color="secondary"
            class="ml-2"
            @click="exportSQL"
          >
            <v-icon
              small
              class="mr-1"
            >
              mdi-export
            </v-icon>
            Export
          </v-btn>
        </div>
      </v-container>
      <AddFieldDialog
        :opened="addFieldDialog"
        @save="addField"
        @close="addFieldDialog = false"
      />
      <AddEntityDialog
        :opened="addEntityDialog"
        @save="addEntity"
        @close="addEntityDialog = false"
      />
      <EditRelationDialog
        :opened="editRelationDialog"
        :relation="entityManager && entityManager[selectedRelation]"
        @save="editRelation"
        @close="editRelationDialog = false"
      />
    </v-content>
  </v-app>
</template>

<script>
  import * as PIXI from 'pixi.js-legacy';
  import { EntityManager } from './managers/entity.manager';
  import { ADD_FIELD, EDIT_RELATION, ERROR } from './constants/events.constants';

  import AddFieldDialog from './components/AddFieldDialog';
  import AddEntityDialog from './components/AddEntityDialog';
  import EditRelationDialog from './components/EditRelationDialog';

  export default {
    components: {
      AddFieldDialog,
      AddEntityDialog,
      EditRelationDialog,
    },
    data: () => ({
      app: null,
      relationsManager: null,
      entityManager: null,
      selectedEntity: null,
      selectedRelation: null,
      entityForMove: null,
      selectedConnector: null,
      connectingLine: null,
      addEntityDialog: false,
      addFieldDialog: false,
      editRelationDialog: false,

      snackbar: false,
      snackbarMessage: null,
    }),
    created() {
      window.addEventListener('resize', this.onResze);
      window.addEventListener('mousemove', this.move);
      window.addEventListener('mouseup', this.unSelect);
    },
    destroyed() {
      window.removeEventListener('resize', this.onResze);
      window.removeEventListener('mousemove', this.move);
      window.removeEventListener('mouseup', this.unSelect);
    },
    mounted() {
      this.app = new PIXI.Application({
        transparent: true,
        antialias: true,
      });
      this.entityManager = new EntityManager(this.app.stage, this.eventHandler.bind(this));

      this.$refs.container.appendChild(this.app.view);
      this.app.renderer.view.style.display = "block";
      this.app.renderer.autoResize = true;
      this.onResze();
    },
    methods: {
      addEntity(name) {
        try {
          this.entityManager.addEntity(name, 50, 50);
        } catch (e) {
          this.snackbar = true;
          this.snackbarMessage = e.message;
          return;
        }
        this.addEntityDialog = false;
      },
      move (e) {
        if (e.buttons && e.srcElement.isEqualNode(this.app.view)) {
          const entityId = this.entityForMove || this.entityManager.findEntity(e.clientX, e.clientY);

          // Move entity
          if (entityId && !this.connectingLine) {
            this.entityForMove = entityId;
            const entity = this.entityManager.entities[entityId];

            entity && entity.move(e.movementX, e.movementY);
            return;
          }

          // Find connector and create conntecting line
          const { connector, entityId: fromEntityId } = this.entityManager.findConnector(e.clientX, e.clientY);
          if (connector && fromEntityId && !this.connectingLine) {
            this.selectedConnector = connector;
            this.selectedEntity = fromEntityId;
          }

          // Move connecting line
          if ((this.selectedConnector && this.selectedEntity) || this.connectingLine) {
            if (!this.connectingLine) {
              this.connectingLine = new PIXI.Graphics();
              this.app.stage.addChild(this.connectingLine);
            }

            this.connectingLine.clear();
            this.connectingLine.position.set(this.selectedConnector.x, this.selectedConnector.y);
            this.connectingLine.lineStyle(2, 0xD5D5D5)
              .moveTo(0, 0)
              .lineTo(e.clientX - this.selectedConnector.x, e.clientY - this.selectedConnector.y);
          }
        }
      },
      unSelect(e) {
        if (this.connectingLine) {
          const { connector: toConnector, entityId: toEntityId } = this.entityManager.findConnector(e.clientX, e.clientY);
          // Create realation from connecting line
          if (toConnector && toEntityId) {
            try {
              this.entityManager.addRelation(
                { entity: this.selectedEntity, field: this.selectedConnector.forRow },
                { entity: toEntityId, field: toConnector.forRow },
              );
            } catch (e) {
              this.snackbar = true;
              this.snackbarMessage = e.message;
            }
          }

          this.selectedEntity = null;
          this.selectedConnector = null;
          this.app.stage.removeChild(this.connectingLine);
          this.connectingLine = null;
        }
        
        this.entityForMove = null;
      },
      addField (options) {
        const entity = this.entityManager.entities[this.selectedEntity];
        if(!entity) {
          return;
        }

        try {
          entity.addField(options);
        } catch (e) {
          this.snackbar = true;
          this.snackbarMessage = e.message;
          return;
        }

        this.selectedEntity = null;
        this.addFieldDialog = false;
      },
      editRelation(fromType, toType) {
        this.entityManager.updateRelation(this.selectedRelation, fromType, toType);
        this.selectedRelation = null;
        this.editRelationDialog = false;
      },
      eventHandler(event, ...args) {
        switch (event) {
          case ADD_FIELD:
            this.selectedEntity = args[0];
            this.addFieldDialog = true;
            break;
          case EDIT_RELATION:
            this.selectedRelation = args[0];
            this.editRelationDialog = true;
            break;
          case ERROR: 
            this.snackbar = true;
            this.snackbarMessage = args[0];
            break;
          default:
            break;
        }
      },
      exportSQL() {
        // TODO: Show dialog
      },
      onResze() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
      },
    },
  }
</script>

<style scoped>
  #container {
    margin: 0;
    padding: 0;
  }
  #toolbar {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 999;
  }
</style>
