import type { Schema, Struct } from '@strapi/strapi';

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
      'ecommerce.variant': EcommerceVariant;
    }
  }
}
