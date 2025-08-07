import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Check,
} from "typeorm";
import { OrderStatus } from "./util";

@Entity("category")
@Check(`("title" <> '') AND ("handle" <> '')`)
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { nullable: false })
  title!: string;

  @Column("varchar", { unique: true, nullable: false })
  handle!: string;

  @Column("int", { nullable: false, default: 0 })
  position!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @OneToMany(() => Product, (product) => product.category, {
    cascade: true,
  })
  products!: Product[];
}

@Entity("product")
@Check(`("title" <> '') AND ("handle" <> '')`)
@Check(`"description" <> ''`)
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { nullable: false })
  title!: string;

  @Column("varchar", { unique: true, nullable: false })
  handle!: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @Column("int")
  category_id!: number;

  @Column("boolean", { nullable: false })
  available!: boolean;

  @Column("text", { nullable: false })
  description!: string;

  @Column("numeric", { nullable: false })
  price!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt!: Date;

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    orphanedRowAction: "delete",
  })
  images!: ProductImage[];
}

@Entity("product_image")
@Check(`"url" <> ''`)
@Check(`"altText" <> ''`)
export class ProductImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { nullable: false })
  url!: string;

  @Column("varchar", { nullable: false })
  altText!: string;

  @Column("int", { nullable: false })
  position!: number;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;
}

@Entity("order")
@Check(`"name" <> ''`)
@Check(`"email" <> ''`)
@Check(`"phone" <> ''`)
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { nullable: false })
  name!: string;

  @Column("varchar", { nullable: false })
  email!: string;

  @Column("varchar", { nullable: false })
  phone!: string;

  @Column("int", { nullable: false })
  totalQuantity!: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: false })
  cost!: number;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.NEW,
    nullable: false,
  })
  status!: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity("order_item")
@Check(`"handle" <> ''`)
@Check(`"title" <> ''`)
@Check(`"imageUrl" <> ''`)
@Check(`"imageAlt" <> ''`)
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("int", { nullable: false })
  productId!: number;

  @Column("varchar", { nullable: false })
  handle!: string;

  @Column("varchar", { nullable: false })
  title!: string;

  @Column("varchar", { nullable: false })
  imageUrl!: string;

  @Column("varchar", { nullable: false })
  imageAlt!: string;

  @Column("int", { nullable: false })
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: false })
  unitAmount!: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: false })
  totalAmount!: number;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: "CASCADE",
  })
  order!: Order;
}

@Entity("user")
@Check(`"username" <> ''`)
@Check(`"email" <> ''`)
@Check(`"password" <> ''`)
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { unique: true, nullable: false })
  username!: string;

  @Column("varchar", { unique: true, nullable: false })
  email!: string;

  @Column("varchar", { nullable: false })
  password!: string;
}
