"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.email_data = exports.OrderStatus = exports.ModelType = exports.NotFoundError = void 0;
exports.title_to_handle = title_to_handle;
function title_to_handle(title) {
    return title.trim().replace(/\s+/g, "-"); // Replace spaces with dash
}
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
var ModelType;
(function (ModelType) {
    ModelType["category"] = "category";
    ModelType["order"] = "order";
    ModelType["product"] = "product";
})(ModelType || (exports.ModelType = ModelType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NEW"] = "new";
    OrderStatus["READY"] = "ready";
    OrderStatus["DONE"] = "done";
    OrderStatus["CANCELED"] = "canceled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
exports.email_data = {
    subjectPrefix: "אישור הזמנה - מס'",
    greeting: "שלום",
    confirmation: "ההזמנה שלך נקלטה.",
    orderNumberLabel: "מספר הזמנה:",
    totalLabel: `סה"כ לתשלום: ₪`,
};
//# sourceMappingURL=util.js.map