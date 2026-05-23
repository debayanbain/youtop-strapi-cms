import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsBestSellers extends Struct.ComponentSchema {
  collectionName: 'components_sections_best_sellers';
  info: {
    displayName: 'Best Sellers';
    icon: 'bulletList';
  };
  attributes: {
    button_link: Schema.Attribute.String;
    button_text: Schema.Attribute.String;
    products: Schema.Attribute.Relation<'oneToMany', 'api::products.products'>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SectionsCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_cta_banners';
  info: {
    displayName: 'CTA Banner';
    icon: 'command';
  };
  attributes: {
    heading: Schema.Attribute.String;
    primary_button_link: Schema.Attribute.String;
    primary_button_text: Schema.Attribute.String;
    secondary_button_link: Schema.Attribute.String;
    secondary_button_text: Schema.Attribute.String;
    subheading: Schema.Attribute.Text;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'Hero';
    icon: 'house';
  };
  attributes: {
    active_learners: Schema.Attribute.BigInteger;
    badge_text: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    hero_image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    highlighted_text: Schema.Attribute.String;
    primary_button_link: Schema.Attribute.String;
    primary_button_text: Schema.Attribute.String;
    secondary_button_link: Schema.Attribute.String;
    secondary_button_text: Schema.Attribute.String;
    subheading: Schema.Attribute.Text;
    success_rate: Schema.Attribute.BigInteger;
  };
}

export interface SectionsJobHighlights extends Struct.ComponentSchema {
  collectionName: 'components_sections_job_highlights';
  info: {
    displayName: 'job-highlights';
    icon: 'chartPie';
  };
  attributes: {
    jobs: Schema.Attribute.Relation<
      'oneToMany',
      'api::job-highlight.job-highlight'
    >;
    title: Schema.Attribute.String;
  };
}

export interface SectionsLatestUpdates extends Struct.ComponentSchema {
  collectionName: 'components_sections_latest_updates';
  info: {
    displayName: 'Latest Updates';
    icon: 'archive';
  };
  attributes: {
    button_link: Schema.Attribute.String;
    button_text: Schema.Attribute.String;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
    updates: Schema.Attribute.Relation<'oneToMany', 'api::update.update'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sections.best-sellers': SectionsBestSellers;
      'sections.cta-banner': SectionsCtaBanner;
      'sections.hero': SectionsHero;
      'sections.job-highlights': SectionsJobHighlights;
      'sections.latest-updates': SectionsLatestUpdates;
    }
  }
}
