"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.OrderItem = exports.Order = exports.ProductImage = exports.Product = exports.Category = void 0;
const typeorm_1 = require("typeorm");
const util_1 = require("./util");
let Category = class Category {
};
exports.Category = Category;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Category.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], Category.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { unique: true, nullable: false }),
    __metadata("design:type", String)
], Category.prototype, "handle", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false, default: 0 }),
    __metadata("design:type", Number)
], Category.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Category.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Product, (product) => product.category, {
        cascade: ["remove"],
    }),
    __metadata("design:type", Array)
], Category.prototype, "products", void 0);
exports.Category = Category = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`("title" <> '') AND ("handle" <> '')`)
], Category);
let Product = class Product {
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], Product.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { unique: true, nullable: false }),
    __metadata("design:type", String)
], Product.prototype, "handle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Category, (category) => category.products, {
        onDelete: "CASCADE",
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: "category_id" }),
    __metadata("design:type", Category)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)("int"),
    __metadata("design:type", Number)
], Product.prototype, "category_id", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", { nullable: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "available", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: false }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { nullable: false }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductImage, (image) => image.product, {
        cascade: true,
        orphanedRowAction: "delete",
    }),
    __metadata("design:type", Array)
], Product.prototype, "images", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`("title" <> '') AND ("handle" <> '')`),
    (0, typeorm_1.Check)(`"description" <> ''`)
], Product);
let ProductImage = class ProductImage {
};
exports.ProductImage = ProductImage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductImage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], ProductImage.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], ProductImage.prototype, "altText", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], ProductImage.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product, (product) => product.images, {
        onDelete: "CASCADE",
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: "product_id" }),
    __metadata("design:type", Product)
], ProductImage.prototype, "product", void 0);
exports.ProductImage = ProductImage = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"url" <> ''`),
    (0, typeorm_1.Check)(`"altText" <> ''`)
], ProductImage);
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], Order.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], Order.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], Order.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], Order.prototype, "totalQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], Order.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: util_1.OrderStatus,
        default: util_1.OrderStatus.NEW,
        nullable: false,
    }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderItem, (item) => item.order, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"name" <> ''`),
    (0, typeorm_1.Check)(`"email" <> ''`),
    (0, typeorm_1.Check)(`"phone" <> ''`)
], Order);
let OrderItem = class OrderItem {
};
exports.OrderItem = OrderItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], OrderItem.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], OrderItem.prototype, "handle", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], OrderItem.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], OrderItem.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], OrderItem.prototype, "imageAlt", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: false }),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], OrderItem.prototype, "unitAmount", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], OrderItem.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order, (order) => order.items, {
        nullable: false,
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Order)
], OrderItem.prototype, "order", void 0);
exports.OrderItem = OrderItem = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"handle" <> ''`),
    (0, typeorm_1.Check)(`"title" <> ''`),
    (0, typeorm_1.Check)(`"imageUrl" <> ''`),
    (0, typeorm_1.Check)(`"imageAlt" <> ''`)
], OrderItem);
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"username" <> ''`),
    (0, typeorm_1.Check)(`"email" <> ''`),
    (0, typeorm_1.Check)(`"password" <> ''`)
], User);
//# sourceMappingURL=entities.js.map