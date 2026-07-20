import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  schemaMarkup?: object;
}

export default function SEOManager({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  schemaMarkup
}: SEOProps) {
  useEffect(() => {
    // 1. Update document title
    document.title = `${title} | Daily Articles for Students`;

    // Helper to get or create a meta tag
    const getOrCreateMeta = (attributeName: string, attributeValue: string, isProperty = false) => {
      const selector = isProperty 
        ? `meta[property="${attributeValue}"]` 
        : `meta[name="${attributeValue}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', attributeValue);
        } else {
          el.setAttribute('name', attributeValue);
        }
        document.head.appendChild(el);
      }
      return el;
    };

    // 2. Meta description
    const descMeta = getOrCreateMeta('name', 'description');
    descMeta.setAttribute('content', description);

    // 3. Open Graph Tags
    const ogTitle = getOrCreateMeta('property', 'og:title', true);
    ogTitle.setAttribute('content', `${title} | Daily Articles for Students`);

    const ogDesc = getOrCreateMeta('property', 'og:description', true);
    ogDesc.setAttribute('content', description);

    const ogImg = getOrCreateMeta('property', 'og:image', true);
    ogImg.setAttribute('content', ogImage);

    const ogUrl = getOrCreateMeta('property', 'og:url', true);
    ogUrl.setAttribute('content', canonicalUrl);

    const ogTypeMeta = getOrCreateMeta('property', 'og:type', true);
    ogTypeMeta.setAttribute('content', ogType);

    const ogSite = getOrCreateMeta('property', 'og:site_name', true);
    ogSite.setAttribute('content', 'Daily Articles for Students');

    // 4. Twitter Card Tags
    const twitterCard = getOrCreateMeta('name', 'twitter:card');
    twitterCard.setAttribute('content', 'summary_large_image');

    const twitterTitle = getOrCreateMeta('name', 'twitter:title');
    twitterTitle.setAttribute('content', `${title} | Daily Articles for Students`);

    const twitterDesc = getOrCreateMeta('name', 'twitter:description');
    twitterDesc.setAttribute('content', description);

    const twitterImg = getOrCreateMeta('name', 'twitter:image');
    twitterImg.setAttribute('content', ogImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. JSON-LD Schema Markup
    let schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (schemaScript) {
      schemaScript.remove(); // Remove previous schema to avoid cluttering
    }

    if (schemaMarkup) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.textContent = JSON.stringify(schemaMarkup);
      document.head.appendChild(schemaScript);
    }
  }, [title, description, canonicalUrl, ogType, ogImage, schemaMarkup]);

  return null; // Side-effect only component
}
