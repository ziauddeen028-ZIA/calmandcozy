import type { Schema, Struct } from '@strapi/strapi';

export interface EcommerceColorVariant extends Struct.ComponentSchema {
  collectionName: 'components_ecommerce_color_variants';
  info: {
    displayName: 'ColorVariant';
    icon: 'palette';
  };
  attributes: {
    backImage: Schema.Attribute.Media<'images'>;
    colorName: Schema.Attribute.String;
    frontImage: Schema.Attribute.Media<'images'>;
  };
}

export interface EcommerceOrderItem extends Struct.ComponentSchema {
  collectionName: 'components_ecommerce_order_items';
  info: {
    description: 'An item in an order';
    displayName: 'Order Item';
    icon: 'shopping-cart';
  };
  attributes: {
    backImageUrl: Schema.Attribute.String;
    backMockupUrl: Schema.Attribute.String;
    backPreviewImageUrl: Schema.Attribute.String;
    customText: Schema.Attribute.Text;
    frontMockupUrl: Schema.Attribute.String;
    frontPreviewImageUrl: Schema.Attribute.String;
    logoPosition: Schema.Attribute.String;
    previewImageUrl: Schema.Attribute.String;
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    productId: Schema.Attribute.String & Schema.Attribute.Required;
    productImage: Schema.Attribute.String;
    productName: Schema.Attribute.String & Schema.Attribute.Required;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<1>;
    selectedColor: Schema.Attribute.String;
    selectedSize: Schema.Attribute.String;
    specialInstructions: Schema.Attribute.Text;
    uploadedImageUrl: Schema.Attribute.String;
  };
}

export interface EcommerceVariant extends Struct.ComponentSchema {
  collectionName: 'components_ecommerce_variants';
  info: {
    description: 'Product variant';
    displayName: 'Variant';
    icon: 'layer';
  };
  attributes: {
    color: Schema.Attribute.String;
    price: Schema.Attribute.Decimal;
    size: Schema.Attribute.String;
    stock: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'ecommerce.color-variant': EcommerceColorVariant;
      'ecommerce.order-item': EcommerceOrderItem;
      'ecommerce.variant': EcommerceVariant;
    }
  }
}
