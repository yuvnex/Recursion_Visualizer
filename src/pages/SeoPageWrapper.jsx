import React from 'react'
import { Helmet } from 'react-helmet-async'
import RecursionVisualizer from './RecursionVisualizer'

export default function SeoPageWrapper({ route }) {
  // Use a canonical URL matching origin or fallback production URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://recursify.dev'
  const canonicalUrl = `${origin}${route.path === '/' ? '' : route.path}`

  return (
    <>
      <Helmet>
        <title>{route.title}</title>
        <meta name="description" content={route.description} />
        {route.keywords && <meta name="keywords" content={route.keywords} />}
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={route.title} />
        <meta property="og:description" content={route.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Recursify" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={route.title} />
        <meta name="twitter:description" content={route.description} />
        
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <RecursionVisualizer initialExampleId={route.initialExampleId} />
    </>
  )
}
