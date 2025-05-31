"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSubscriber = exports.ProductSubscriber = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("./entities");
let ProductSubscriber = class ProductSubscriber {
    listenTo() {
        return entities_1.Product;
    }
    async beforeInsert(event) {
        const product = event.entity;
        if (!product ||
            !Array.isArray(product.images) ||
            product.images.length === 0) {
            throw new Error("no image");
        }
    }
    async beforeUpdate(event) {
        const product = event.entity;
        if (!product)
            return;
        if (!Array.isArray(product.images) || product.images.length === 0) {
            throw new Error("no image");
        }
    }
};
exports.ProductSubscriber = ProductSubscriber;
exports.ProductSubscriber = ProductSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)()
], ProductSubscriber);
let OrderSubscriber = class OrderSubscriber {
    listenTo() {
        return entities_1.Order;
    }
    async beforeInsert(event) {
        const order = event.entity;
        if (!order.items || order.items.length === 0) {
            throw new Error("no cart items");
        }
    }
};
exports.OrderSubscriber = OrderSubscriber;
exports.OrderSubscriber = OrderSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)()
], OrderSubscriber);
//# sourceMappingURL=subscribers.js.map