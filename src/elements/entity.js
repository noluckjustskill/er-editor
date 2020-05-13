import { v4 as guid } from 'uuid';
import * as PIXI from 'pixi.js-legacy';
import { ADD_FIELD, ADD_PRIMARY_KEY, REMOVE_FIELD, REMOVE_ENTITY, MOVE_ENTITY, ERROR } from '../constants/events.constants';

export const WIDTH = 300;
export const FIELD_HEIGHT = 30;

const CAPTION_TEXT_STYLE =  {
  fontFamily: 'Arial',
  fontSize: 16,
  fontWeight: 'bold',
};
const TEXT_STYLE =  {
  fontFamily: 'Arial',
  fontSize: 16,
};
const ICON_SIZE = 20;

export class Entity {
  x; y;
  view = new PIXI.Container();
  header = new PIXI.Graphics();
  iconAdd = new PIXI.Sprite(PIXI.Texture.from(require('../assets/plus.png')));
  iconRemoveEntity = new PIXI.Sprite(PIXI.Texture.from(require('../assets/remove.png')));

  fields = {};
  primaryKey = null;

  constructor({ id = guid(), name, x, y, primaryKey, emit }) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.primaryKey = primaryKey;
    this.emit = emit;

    this.header.interactive = true;
    this.header.cursor = 'move';
    this.view.addChild(this.header);

    this.titleText = new PIXI.Text(this.name, CAPTION_TEXT_STYLE);
    this.titleText.anchor.set(0.5, 0.5);
    this.view.addChild(this.titleText);

    this.iconRemoveEntity.interactive = true;
    this.iconRemoveEntity.cursor = 'pointer';
    this.iconRemoveEntity.width = ICON_SIZE * 0.75;
    this.iconRemoveEntity.height = ICON_SIZE * 0.75;
    this.iconRemoveEntity.anchor.set(0.5);
    this.iconRemoveEntity.on('click', () => this.emit(REMOVE_ENTITY, this.id));
    this.view.addChild(this.iconRemoveEntity);

    this.iconAdd.interactive = true;
    this.iconAdd.cursor = 'pointer';
    this.iconAdd.width = ICON_SIZE;
    this.iconAdd.height = ICON_SIZE;
    this.iconAdd.anchor.set(0.5);
    this.iconAdd.on('click', () => this.emit(ADD_FIELD, this.id));
    this.view.addChild(this.iconAdd);
  }

  checkPosition(x, y) {
    return this.header.containsPoint({ x, y });
  }

  getConnector(x, y) {
    const connector = this.view.children.find(c => c.containsPoint && c.containsPoint({ x, y }));
    return connector && connector.forRow ? connector : null;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;

    this.render();
    this.emit(MOVE_ENTITY);
  }

  moveAddIcon() {
    const offset = Object.keys(this.fields).length + 1;
    this.iconAdd.position.set(
      this.x + WIDTH / 2,
      this.y + (FIELD_HEIGHT * offset) + this.iconAdd.height / 3,
    );
  }

  render() {    
    this.header.clear();
    this.header.lineStyle(1, 0x000000, 1);
    this.header.beginFill(0xD5D5D5);
    this.header.drawRect(this.x, this.y, WIDTH, FIELD_HEIGHT);
    this.header.endFill();
    this.titleText.position.set(this.x + WIDTH / 2, this.y + FIELD_HEIGHT / 2);
    this.iconRemoveEntity.position.set(
      this.x + WIDTH - ICON_SIZE,
      this.y + FIELD_HEIGHT / 2,
    );
    this.moveAddIcon();
    this.renderFields();
  }

  renderFields() {
    this.view.children
      .filter(c => c.forRow)
      .concat(Object.values(this.fields).map(({ view }) => view))
      .forEach(c => this.view.removeChild(c));

    Object.keys(this.fields).forEach((name, i) => {
      this.fields[name].view = new PIXI.Container();

      const border = new PIXI.Graphics();
      border.position.set(this.x, this.y + (i + 1) * FIELD_HEIGHT);
      border.lineStyle(1, 0x000000)
       .moveTo(0, 0)
       .lineTo(0, FIELD_HEIGHT)
       .lineTo(WIDTH / 2, FIELD_HEIGHT)
       .lineTo(WIDTH / 2, 0)
       .moveTo(WIDTH / 2, FIELD_HEIGHT)
       .lineTo(WIDTH, FIELD_HEIGHT)
       .lineTo(WIDTH, 0);

      const nameText = new PIXI.Text(name, CAPTION_TEXT_STYLE);
      nameText.anchor.set(0.5, 0.5);
      nameText.position.set(this.x + WIDTH / 4, this.y + FIELD_HEIGHT * (i + 1) + FIELD_HEIGHT / 2);

      const typeText = new PIXI.Text(this.fields[name].type || '?', TEXT_STYLE);
      typeText.anchor.set(0.5, 0.5);
      typeText.position.set(this.x + WIDTH * 0.75, this.y + FIELD_HEIGHT * (i + 1) + FIELD_HEIGHT / 2);

      const iconRemove = new PIXI.Sprite(PIXI.Texture.from(require('../assets/minus.png')));
      iconRemove.interactive = true;
      iconRemove.cursor = 'pointer';
      iconRemove.anchor.set(0.5, 0.5);
      iconRemove.width = ICON_SIZE;
      iconRemove.height = ICON_SIZE;
      iconRemove.position.set(
        this.x + WIDTH - ICON_SIZE,
        this.y + FIELD_HEIGHT * (i + 1) + FIELD_HEIGHT / 2,
      );
      iconRemove.on('click', () => this.deleteField(name));

      const iconPrimaryKey = new PIXI.Sprite(PIXI.Texture.from(require('../assets/key.png')));
      iconPrimaryKey.interactive = true;
      iconPrimaryKey.alpha = this.primaryKey === name ? 1 : 0;
      iconPrimaryKey.anchor.set(0.5, 0.5);
      iconPrimaryKey.width = ICON_SIZE;
      iconPrimaryKey.height = ICON_SIZE;
      iconPrimaryKey.position.set(
        this.x + ICON_SIZE,
        this.y + FIELD_HEIGHT * (i + 1) + FIELD_HEIGHT / 2,
      );
      iconPrimaryKey
        .on('click', () => {
          if (!this.primaryKey) {
            const done = this.setPrimaryKey(name);
            if (done) iconPrimaryKey.alpha = 1;
          } else if (this.primaryKey === name) {
            this.primaryKey = null;
            iconPrimaryKey.alpha = 0.6;
          }
        })
        .on('mouseover', () => {
          if (!this.primaryKey || this.primaryKey === name) {
            iconPrimaryKey.cursor = 'pointer';
            if (!this.primaryKey) {
              iconPrimaryKey.alpha = 0.6;
            }
          }
        })
        .on('mouseout', () => {
          if (this.primaryKey !== name) {
            iconPrimaryKey.cursor = 'default';
            iconPrimaryKey.alpha = 0;
          }
        });

      this.fields[name].view.addChild(nameText);
      this.fields[name].view.addChild(typeText);
      this.fields[name].view.addChild(iconRemove);
      this.fields[name].view.addChild(iconPrimaryKey);
      this.fields[name].view.addChild(border);
      this.createConnectors(name, i).forEach(connector => this.view.addChild(connector));

      this.view.addChild(this.fields[name].view);
    });

    this.moveAddIcon();
  }

  createConnectors(name, row) {
    const firstConnector = new PIXI.Sprite(PIXI.Texture.from(require('../assets/connect.png')));
    firstConnector.forRow = name;
    firstConnector.interactive = true;
    firstConnector.alpha = 0;
    firstConnector.cursor = 'crosshair';
    firstConnector.width = FIELD_HEIGHT / 3;
    firstConnector.height = FIELD_HEIGHT / 3;
    firstConnector.position.set(
      this.x - FIELD_HEIGHT / 6,
      this.y + FIELD_HEIGHT * (row + 1) + FIELD_HEIGHT / 3,
    );
    firstConnector
      .on('mouseover', () => {
        firstConnector.alpha = 1;
      })
      .on('mouseout', () => {
        firstConnector.alpha = 0;
      });

    const secondConnector = new PIXI.Sprite(PIXI.Texture.from(require('../assets/connect.png')));
    secondConnector.forRow = name;
    secondConnector.interactive = true;
    secondConnector.alpha = 0;
    secondConnector.cursor = 'crosshair';
    secondConnector.width = FIELD_HEIGHT / 3;
    secondConnector.height = FIELD_HEIGHT / 3;
    secondConnector.position.set(
      this.x + this.width - FIELD_HEIGHT / 6,
      this.y + FIELD_HEIGHT * (row + 1) + FIELD_HEIGHT / 3,
    );
    secondConnector
      .on('mouseover', () => {
        secondConnector.alpha = 1;
      })
      .on('mouseout', () => {
        secondConnector.alpha = 0;
      });

    return [firstConnector, secondConnector];
  }

  addField({ name, ...options }) {
    if (this.fields[name]) {
      throw new Error('Field already exists');
    }

    this.fields[name] = options;
    this.renderFields();
  }

  deleteField(name) {
    this.emit(REMOVE_FIELD, this.id, name);

    this.fields[name].view.destroy();
    delete this.fields[name];
    if (this.primaryKey === name) {
      this.primaryKey = null;
    }

    this.renderFields();
    this.moveAddIcon();
  }

  setPrimaryKey(name) {
    if (this.primaryKey) {
      return;
    }
    try {
      if (!this.fields[name]) {
        throw new Error('Field not found');
      }
      if (this.fields[name].nullable) {
        throw new Error('Primary key must be not null');
      }

      this.primaryKey = name;
      this.emit(ADD_PRIMARY_KEY);
      return true;
    } catch(e) {
      this.emit(ERROR, e.message);
      return false;
    }
  }

  get width() {
    return WIDTH;
  }

  get height() {
    return (Object.keys(this.fields).length + 1) * FIELD_HEIGHT;
  }
}
