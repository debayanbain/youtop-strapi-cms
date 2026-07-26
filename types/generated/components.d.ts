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
    daily_lessons: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    hero_image: Schema.Attribute.Media<'images'>;
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

export interface SharedBadge extends Struct.ComponentSchema {
  collectionName: 'components_shared_badges';
  info: {
    displayName: 'Badge';
    icon: 'manyToOne';
  };
  attributes: {
    color: Schema.Attribute.Enumeration<
      ['yellow', 'green', 'purple', 'red', 'blue']
    >;
    text: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
    icon: 'cursor';
  };
  attributes: {
    coming_soon: Schema.Attribute.Boolean;
    is_external: Schema.Attribute.Boolean;
    link: Schema.Attribute.String;
    text: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'outline', 'ghost']
    >;
  };
}

export interface SharedFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_columns';
  info: {
    displayName: 'FooterColumn';
    icon: 'bulletList';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.nav-link', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
  };
}

export interface SharedNavLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_links';
  info: {
    displayName: 'NavLink';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 40;
      }>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'SocialLink';
    icon: 'cursor';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      [
        'facebook',
        'instagram',
        'youtube',
        'telegram',
        'twitter',
        'linkedin',
        'discord',
        'github',
      ]
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSourceMeta extends Struct.ComponentSchema {
  collectionName: 'components_shared_source_metas';
  info: {
    displayName: 'SourceMeta';
    icon: 'globe';
  };
  attributes: {
    scraped_at: Schema.Attribute.DateTime;
    source_name: Schema.Attribute.String;
    source_type: Schema.Attribute.Enumeration<['manual', 'scraped']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'manual'>;
    source_url: Schema.Attribute.Text;
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
      'shared.badge': SharedBadge;
      'shared.button': SharedButton;
      'shared.footer-column': SharedFooterColumn;
      'shared.nav-link': SharedNavLink;
      'shared.social-link': SharedSocialLink;
      'shared.source-meta': SharedSourceMeta;
    }
  }
}
