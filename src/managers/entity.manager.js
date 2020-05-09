import { v4 as guid } from 'uuid';
import * as PIXI from 'pixi.js-legacy';
import isEqual from 'lodash.isequal';
import { Entity, FIELD_HEIGHT } from "../elements/entity";
import { MySQLTypes } from "../constants/mysql-types.constants";
import { ADD_FIELD, REMOVE_FIELD, REMOVE_ENTITY, MOVE_ENTITY, EDIT_RELATION, ERROR } from "../constants/events.constants";
import { RELATIONS_TYPES } from '../constants/relations.constants';

const ICON_SIZE = 20;
const TEXT_STYLE =  {
  fontFamily: 'Arial',
  fontSize: 14,
  fontStyle: 'italic',
};

export class EntityManager {
  view = new PIXI.Container();
  entities = {};
  relations = {};

  constructor (container, emit) {
    container.addChild(this.view);
    this.container = container;
    this.emit = emit;
  }

  addEntity(name, x, y) {
    if (Object.values(this.entities).find(e => e.name === name)) {
      throw new Error('Entity already exists');
    }

    const entity = new Entity(name, x, y, this.eventHandler.bind(this));
    this.entities[entity.id] = entity;
    this.container.addChild(entity.view);

    entity.render();
    
    return entity.id;
  }

  findEntity(x, y) {
    return Object.keys(this.entities).find(key => this.entities[key].checkPosition(x, y));
  }

  findConnector(x, y) {
    let connector;
    for (let entityId in this.entities) {
      connector = this.entities[entityId].getConnector(x, y);
      if (connector) {
        return { connector, entityId };
      }
    }

    return {};
  }

  removeEntity(id) {
    if (!this.entities[id]) return;

    this.removeRelation(null, id);
    this.entities[id].view.destroy();
    delete this.entities[id];
  }

  addRelation(from, to) {
    if (!(from && from.entity && from.field) || !(to && to.entity && to.field)) {
      throw new Error('Bad params');
    }

    if (!this.entities[from.entity] || !this.entities[to.entity]) {
      throw new Error('Entity not found');
    }

    if (!this.entities[from.entity].fields[from.field] || !this.entities[to.entity].fields[to.field]) {
      throw new Error('Field not found');
    }

    const { type: fromType, unsigned: fromUnsigned } = this.entities[from.entity].fields[from.field];
    const { type: toType, unsigned: toUnsigned } = this.entities[to.entity].fields[to.field];
    if (fromType !== toType || Boolean(fromUnsigned) !== Boolean (toUnsigned)) {
      throw new Error('Different types of fields');
    }

    if (Object.values(this.relations).find(rel => isEqual(rel, {from, to}))) {
      console.warn('Relation already exists');
      return;
    }

    const id = guid();
    this.relations[id] = { from, to };

    this.renderRelations();

    return id;
  }

  updateRelation(relationId, typeFrom, typeTo) {
    if (!this.relations[relationId]) {
      throw new Error('Relation not found');
    }

    this.relations[relationId].from.type = typeFrom;
    this.relations[relationId].to.type = typeTo;

    this.renderRelations();
  }

  removeRelation(relationId, entityId, fieldName) {
    if (relationId) {
      delete this.relations[relationId];
    } else {
      Object.keys(this.relations).forEach(id => {
        if (this.relations[id].from.entity === entityId || this.relations[id].to.entity === entityId) {
          if (!fieldName || this.relations[id].from.field === fieldName || this.relations[id].to.field === fieldName) {
            delete this.relations[id];
          }
        }
      });
    }

    this.renderRelations();
  }

  eventHandler(event, ...args) {
    switch (event) {
      case MOVE_ENTITY:
        this.renderRelations();
        break;
      case REMOVE_ENTITY:
        this.removeEntity(args[0]);
        break;
      case ADD_FIELD:
        this.emit(ADD_FIELD, args[0]);
        break;
      case REMOVE_FIELD:
        this.removeRelation(null, args[0], args[1]);
        break;
      case ERROR: 
        this.emit(ERROR, args[0]);
        break;
      default:
        break;
    }
  }

  renderRelations() {
    for (var i = this.view.children.length - 1; i >= 0; i--) {
      this.view.removeChild(this.view.children[i]);
    }

    Object.keys(this.relations).forEach(id => {
      const { from, to } = this.relations[id];

      const fromEntity = this.entities[from.entity];
      const toEntity = this.entities[to.entity];

      const fromRight = fromEntity.x - toEntity.x <= toEntity.width;
      const fromX = fromRight ? (fromEntity.x + fromEntity.width) : fromEntity.x;
      const fromY = fromEntity.y + (Object.keys(fromEntity.fields).indexOf(from.field) + 1) * FIELD_HEIGHT + FIELD_HEIGHT / 2;

      const toRight = fromRight ? (Math.abs(fromEntity.x - toEntity.x) < toEntity.width) : (toEntity.x + toEntity.width < fromEntity.x);
      const toX = !toRight ? toEntity.x : (toEntity.x + toEntity.width);
      const toY = toEntity.y + (Object.keys(toEntity.fields).indexOf(to.field) + 1) * FIELD_HEIGHT + FIELD_HEIGHT / 2;

      let firstTurnX, firstTurnY = 0, buttonXOffset = 0;
      if ((fromRight && !toRight) || (!fromRight && toRight)) {
        firstTurnX = (toX - fromX) / 2;
        buttonXOffset = firstTurnX > 0 ? fromEntity.width : 0;
      } else if (fromRight && toRight) {
        firstTurnX = fromX >= toX ? 50 : toX - fromX + 50;
        buttonXOffset = fromEntity.width;
      } else if (!fromRight && !toRight) {
        firstTurnX = -50;
      }

      const line = new PIXI.Graphics();
      line.position.set(fromX, fromY);
      line.lineStyle(1, 0x000000)
        .moveTo(0, 0)
        .lineTo(firstTurnX, firstTurnY)
        .lineTo(firstTurnX, toY - fromY)
        .lineTo(toX - fromX, toY - fromY);

      this.view.addChild(line);

      const fromTypeText = new PIXI.Text(from.type === RELATIONS_TYPES[1] ? 'N' : '1', TEXT_STYLE);
      fromTypeText.position.set(fromX + 5 * (fromRight ? 1 : -3), fromY - 20);
      this.view.addChild(fromTypeText);

      const toTypeText = new PIXI.Text(to.type === RELATIONS_TYPES[1] ? 'N' : '1', TEXT_STYLE);
      toTypeText.position.set(toX + 5 * (toRight ? 1 : -3), toY - 20);
      this.view.addChild(toTypeText);

      const deleteButton = new PIXI.Sprite(PIXI.Texture.from(require('../assets/remove.png')));
      deleteButton.interactive = true;
      deleteButton.cursor = 'pointer';
      deleteButton.width = ICON_SIZE * 0.75;
      deleteButton.height = ICON_SIZE * 0.75;
      deleteButton.anchor.set(0.5);
      deleteButton.position.set(fromEntity.x + firstTurnX + buttonXOffset, fromEntity.y + fromEntity.height + (toY - fromY) / 2 - ICON_SIZE);
      deleteButton.on('click', () => this.removeRelation(id));

      this.view.addChild(deleteButton);

      const editButton = new PIXI.Sprite(PIXI.Texture.from(require('../assets/edit.png')));
      editButton.interactive = true;
      editButton.cursor = 'pointer';
      editButton.width = ICON_SIZE * 0.75;
      editButton.height = ICON_SIZE * 0.75;
      editButton.anchor.set(0.5);
      editButton.position.set(fromEntity.x + firstTurnX + buttonXOffset, fromEntity.y + fromEntity.height + (toY - fromY) / 2);
      editButton.on('click', () => this.emit(EDIT_RELATION, id));

      this.view.addChild(editButton);
    });
  }

  exportToSQL() {
    let exportString = '';

    const convertDefaultValue = (val) => {
      const num = Number(val);
      return isNaN(num) ? `'${val}'` : num;
    };

    Object.keys(this.entities).forEach(id => {
      exportString += `CREATE TABLE IF NOT EXISTS \`${this.entities[id].name}\` (\n`;

      const fields = this.entities[id].fields;
      Object.keys(fields).forEach((fieldName, i, arr) => {
        const field = fields[fieldName];
        // Field name
        exportString += `\t\`${fieldName}\``;

        // Field type
        if (MySQLTypes[field.type].is) {
          exportString += ` ${MySQLTypes[field.type].is}`;
        } else {
          exportString += ` ${field.type + (field.length ? `(${field.length})` : '')} ${field.unsigned ? 'UNSIGNED' : ''}`.trimRight();
        }

        // Nullable
        exportString += ` ${!field.nullable ? 'NOT' : ''} NULL`;

        // Default value
        exportString += ` ${field.defaultValue ? `DEFAULT ${convertDefaultValue(field.defaultValue)}` : ''}`.trimRight();

        if (i < arr.length - 1 || this.entities[id].primaryKey) {
          exportString += `,`;
        } 
        exportString += `\n`;
      });

      if (this.entities[id].primaryKey) {
        exportString += `\tPRIMARY KEY (\`${this.entities[id].primaryKey}\`)\n`;
      }

      exportString += `);\n\n`;
    });

    Object.values(this.relations).forEach(({ from, to }) => {
      const fromName = this.entities[from.entity].name;
      const toName = this.entities[to.entity].name;

      exportString += `ALTER TABLE \`${fromName}\` ADD FOREIGN KEY (\`${from.field}\`) REFERENCES \`${toName}\`(\`${to.field}\`);\n`;
      exportString += `ALTER TABLE \`${toName}\` ADD FOREIGN KEY (\`${to.field}\`) REFERENCES \`${fromName}\`(\`${from.field}\`);\n`;

      if (from.type !== RELATIONS_TYPES[1]) {
        exportString += `ALTER IGNORE TABLE \`${fromName}\` ADD UNIQUE INDEX(\`${from.field}\`);\n`;
      }
      if (to.type !== RELATIONS_TYPES[1]) {
        exportString += `ALTER IGNORE TABLE \`${toName}\` ADD UNIQUE INDEX(\`${to.field}\`);\n`;
      }
    });

    return exportString;
  }
}
