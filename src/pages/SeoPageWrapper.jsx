import React from 'react';
import { Helmet } from 'react-helmet-async';
import RecursionVisualizer from './RecursionVisualizer';

export default function SeoPageWrapper({ route }) {
  // Use a canonical URL if we are deployed. Adjust base domain as necessary.
  const canonicalUrl = `https://yuvanesh.github.io/Recuriv${route.path === '/' ? '' : route.path}`;

  return (
    <>
      <Helmet>
        <title>{route.title}</title>
        <meta name="description" content={route.description} />
        <meta name="keywords" content={route.keywords} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={route.title} />
        <meta property="og:description" content={route.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Recuriv" />
        
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <RecursionVisualizer initialExampleId={route.initialExampleId}>
        {route.content}
      </RecursionVisualizer>
    </>
  );
}
